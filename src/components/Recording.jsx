import { useState } from "react";
import "./Recording.css";
import { useNavigate } from 'react-router-dom';
import { useReactMediaRecorder  } from "react-media-recorder";
import { Mic } from 'lucide-react';
import OpenAI from "openai";


function App({ TranscribedText }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

 const { status, startRecording, stopRecording, mediaBlobUrl } =
  useReactMediaRecorder({ audio: true });

  const handleUploadAndTranscribe = async () => {
      const apiKey = import.meta.env.VITE_OPENAI_KEY;
    
      const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    
     
    try{ 
        const response = await fetch(mediaBlobUrl);
        const audioBlob = await response.blob(); 

    console.log(audioBlob);
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });


    const  transcription = await openai.audio.transcriptions.create({
      file:  audioFile,
      model: "whisper-1",
      language: "en"
    });
    
    
    TranscribedText(transcription.text);
    }catch (e){
      console.log(e.message)
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
      {mediaBlobUrl && (
              <div>
                <audio src={mediaBlobUrl} controls />
              </div>
            )}
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
        {status === 'recording' ? 
            <button className="action-btn"
                onClick= {
                  stopRecording 
                }
              >
                <Mic size={16} />
                Stop Recording
              </button>
              : 
              <button className="action-btn" onClick={startRecording}>
                <Mic size={16} />
                Voice Chat
              </button>
              } 

              
               
      </div>
    </div>
  );
}

export default App;
