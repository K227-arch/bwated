import React from 'react';

const AudioMessage = ({ stream }) => {
  return (
    <div className="audio-message">
      <audio controls>
        <source src={URL.createObjectURL(stream)} type="audio/webm" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioMessage;