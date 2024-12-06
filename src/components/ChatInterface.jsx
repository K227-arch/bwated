import React, { useState } from 'react';
import { Send, Mic, Download, BookOpen, PenSquare } from 'lucide-react';
import './ChatInterface.css';

export default function ChatInterface() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="message">
          <div className="avatar">AI</div>
          <div className="message-content">
            <p>Hello! I'm ready to help you with your PDF document. You can ask me questions or request specific information.</p>
          </div>
        </div>
        
        <div className="message user">
          <div className="message-content">
            <p>Can you summarize the main points of the document?</p>
          </div>
        </div>
      </div>
      
      <div className="action-bar">
        <div className="action-buttons">
          <button className="action-btn">
            <Mic size={16} />
            Voice Chat
          </button>
          <button className="action-btn">
            <BookOpen size={16} />
            Take Test
          </button>
          <button className="action-btn">
            <Download size={16} />
            Download Chat
          </button>
          <button className="action-btn">
            <PenSquare size={16} />
            Make a Note
          </button>
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSend}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}