import { useState } from "react";
import "./Recording.css";
import { useNavigate } from 'react-router-dom';
import OpenAI from "openai";
import { ReactMediaRecorder, useReactMediaRecorder  } from "react-media-recorder";


function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);


  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const handleGenerate = async () => {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true  // Replace with your OpenAI API key
    });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract text response
      const textResponse = response.choices[0].message.audio.transcript;
      setResponseText(textResponse);

      // Extract audio data and create a Blob URL
      const audioData = response.choices[0].message.audio.data;
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))], {
        type: "audio/wav",
      });
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioSrc(audioURL);
    } catch (error) {
      console.error("Error generating text and audio:", error);
    }
  }; 

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
