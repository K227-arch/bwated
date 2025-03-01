import { useState } from "react";
import './even.css';
import AudioMessage from './AudioMessage';

function Message({ event, audioStream }) {
  // Handle user text messages
  if (event.type === "conversation.item.create" && event.item?.role === "user") {
    return (
      <div className="user-message">
        <div className="message-content">
          {event.item.content[0].text}
          {audioStream && <AudioMessage stream={audioStream} />}
        </div>
      </div>
    );
  }

  // Handle AI responses (both text and transcribed audio)
  if (event.type === "response.audio_transcript.done" || 
      (event.type === "content.part" && event.content?.text)) {
    return (
      <div className="ai-message">
        <div className="message-content">
          {event.transcript || event.content.text}
        </div>
      </div>
    );
  }

  return null;
}

export default function EventLog({ events, isTranscribing, audioStreams }) {
  return (
    <div className="messages-container">
      {events.length === 0 ? (
        <div className="empty-state">Start a conversation...</div>
      ) : (
        <div className="messages-list">
          {events.map((event, index) => (
            <Message 
              key={event.event_id || index} 
              event={event} 
              audioStream={audioStreams[event.event_id]}
            />
          ))}
          {isTranscribing && (
            <div className="ai-message">
              <div className="typing-indicator">AI is typing...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
