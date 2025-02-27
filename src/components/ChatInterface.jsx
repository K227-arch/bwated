import { useEffect, useRef, useState } from "react";
import "./ChatInterface.css";
import EventLog from "./chatComponentes/EventLog";
import SessionControls from "./chatComponentes/SessionControls";
import ToolPanel from "./chatComponentes/ToolPanel";
import ReactDOMServer from 'react-dom/server';

function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    try {
      setIsConnecting(true);
      setError(null);

      // Get an ephemeral key from the server
      const tokenResponse = await fetch("http://localhost:3000/token");
      if (!tokenResponse.ok) {
        throw new Error('Failed to get authentication token');
      }
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create and configure peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      // console.log(pc)

      // Set up audio element
      const audio = new Audio();
      audio.autoplay = true;
      audioElement.current = audio;

      // Handle remote stream
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          stopSession();
          setError('Connection failed. Please try again.');
        }
      };

      // Set up media stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      } catch (mediaError) {
        throw new Error('Microphone access denied');
      }

      // Set up data channel
      const dc = pc.createDataChannel("oai-events", {
        ordered: true
      });
      
      dc.onopen = () => {
        setIsSessionActive(true);
        setEvents([]);
        sendInitialPrompt(dc);
      };

      dc.onerror = (err) => {
        console.error('Data channel error:', err);
        setError('Communication error occurred');
      };

      setDataChannel(dc);

      // Create and set offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true
      });
      await pc.setLocalDescription(offer);

      // Send offer to server
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish connection with OpenAI');
      }

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;

    } catch (error) {
      console.error('Session start error:', error);
      setError(error.message);
      stopSession();
    } finally {
      setIsConnecting(false);
    }
  }

  function sendInitialPrompt(dc) {
    const initialPrompt = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{
          type: "input_text",
          text: `You are a tutor who drives conversations related to atomic structure and helps students understand the text better. Only answer questions in relation to this context.`
        }]
      },
      event_id: crypto.randomUUID()
    };
    
    if (dc.readyState === 'open') {
      dc.send(JSON.stringify(initialPrompt));
    }
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    // Close data channel first
    if (dataChannel) {
      dataChannel.close();
      setDataChannel(null);
    }

    // Clean up peer connection
    if (peerConnection.current) {
      // Stop all tracks
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Clean up audio element
    if (audioElement.current) {
      audioElement.current.srcObject = null;
      audioElement.current = null;
    }

    setIsSessionActive(false);
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
        sendTextMessage(`speak english you are a tutor who drives conversations related to this passage and helps students understand the text better and only answer to questions in relation to this context.
The structure of an atom:
 
An atom is the smallest particle of an element that can take part in a chemical reaction. An 
atom consists of three particles namely;
▪ Electrons
▪ Neutrons
▪ Protons 
An atom is made of a central part called the nucleus around which electrons revolve. 
The nucleus is positively charged because it consists of protons which are positively charged 
and neutrons which have no charge. The properties of the particles of an atom are as shown 
in the table below.
Name Symbol Mass Charge
Protons
Neutrons
Electrons 
P
n
e
1
1
0
 
        `);
      });
    }
  }, [dataChannel]);

  return (
   <div className="chat-interface">
      <nav className="chat-nav">
        <div className="nav-content">
          <h1>AI Tutor Chat</h1>
          {error && <div className="error-message">{error}</div>}
        </div>
      </nav>
      
      <main className="chat-main">
        <section className="chat-messages">
          <EventLog events={events} />
        </section>
        
        <section className="chat-controls">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
            isConnecting={isConnecting}
          />
        </section>
        
        <section className="chat-tools">
          <ToolPanel
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
          />
        </section>
      </main>
    </div>
  );
}

// Add this export for SSR
export function render(url) {
  const html = ReactDOMServer.renderToString(<App />);
  return { html };
}

export default App;