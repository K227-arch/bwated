import React from 'react';
import './VoiceIndicator.css';

const VoiceIndicator = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="voice-indicator">
      <div className="voice-bars">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="voice-bar" />
        ))}
      </div>
      <span className="voice-label">AI is speaking...</span>
    </div>
  );
};

export default VoiceIndicator;