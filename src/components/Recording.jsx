import { useState } from "react";
import "./Recording.css";
import { useNavigate } from 'react-router-dom';

function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const navigate = useNavigate()
  const gotoTest =()=>{
    navigate('/test')
  }
  
  return (
    <div className="chat-container2">
      <div className="listening-section">
        <div className="listening-text">Listening</div>
        <div className="waveform">
          {[...Array(25)].map((_, index) => (
            <div
              key={index}
              className={`wave-bar ${isPaused ? "paused" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="control-btn text-chat">
          <span5 className="chat-icon">💬</span5>
          Text Chat
        </button>
        <button className="control-btn quiz-mode" onClick={gotoTest}>
          <span5 className="quiz-icon">🎲</span5>
          Quiz Mode
        </button>
        <button
          className="control-btn pause"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "▶️ Play" : "⏸️ Pause"}
        </button>
        <button
          className="control-btn options"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
        >
          Options {isOptionsOpen ? "▼" : "▲"}
        </button>
      </div>
    </div>
  );
}

export default App;
