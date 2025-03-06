import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare } from "react-feather";
import Button from "./Button";
import './SessionControls.css';

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;
    setIsActivating(true);
    startSession();
  }

  return (
    <div className="session-container">
      <Button
        onClick={handleStartSession}
        className={`session-button ${isActivating ? 'button-activating' : 'button-start'}`}
        icon={<CloudLightning className="icon-pulse" height={20} />}
      >
        {isActivating ? "Starting session..." : "Start Session"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession, sendTextMessage }) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  return (
    <div className="session-container">
      <Button 
        onClick={stopSession} 
        icon={<CloudOff height={20} />}
        className="session-button button-disconnect"
      >
        Disconnect
      </Button>
    </div>
  );
}

function ChatIndicator() {
  return (
    <div className="chat-indicator-wrapper">
      <div className="chat-indicator">
        <div className="chat-dots">
          <div className="chat-dot"></div>
          <div className="chat-dot"></div>
          <div className="chat-dot"></div>
        </div>
        <span className="chat-label">Bwated is Active</span>
      </div>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  serverEvents,
  isSessionActive,
}) {
  return (
    <div className="controls-container">
      { isSessionActive && <ChatIndicator />}
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          serverEvents={serverEvents}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
