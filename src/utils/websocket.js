class ChatWebSocket {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimeout = null;
    this.callbacks = {
      message: () => {},
      open: () => {},
      close: () => {},
      error: () => {},
      status: () => {} // New callback for connection status updates
    };
  }

  connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const port = import.meta.env.VITE_SERVER_PORT || 3000;
      
      this.ws = new WebSocket(`${protocol}//${host}:${port}/chat`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.callbacks.status('connected');
        this.callbacks.open();
      };

      this.ws.onclose = () => {
        this.callbacks.status('disconnected');
        this.callbacks.close();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.callbacks.status('error');
        this.callbacks.error(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ping') {
            this.send({ type: 'pong' });
            return;
          }
          this.callbacks.message(event);
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
      this.callbacks.status('error');
      this.callbacks.error(error);
    }
  }

  disconnect(reason = 'user_initiated') {
    if (this.ws) {
      // Clear any pending reconnection
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Send close message if connection is open
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'close', reason });
      }

      this.ws.close();
      this.ws = null;
      this.callbacks.status('disconnected');
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Send error:', error);
        return false;
      }
    }
    return false;
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.callbacks.status(`reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      this.callbacks.status('failed');
      this.callbacks.error(new Error('Max reconnection attempts reached'));
    }
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  // Method to check connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Method to explicitly cancel ongoing connection attempts
  cancelConnection() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.disconnect('cancelled');
  }
}

export const chatWebSocket = new ChatWebSocket();