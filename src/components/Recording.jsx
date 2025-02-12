import { useState } from "react";
import "./Recording.css";
import { useNavigate } from 'react-router-dom';
import OpenAI from "openai";
import { ReactMediaRecorder, useReactMediaRecorder  } from "react-media-recorder";

import { ArrowRight, Send, Mic, Link, BookOpen} from 'lucide-react';

function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [question, setQuestion] = useState('');

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const { status, startRecording, stopRecording, mediaBlobUrl } =
  useReactMediaRecorder({ audio: true });


  const handleUploadAndTranscribe = async () => {
    try{ 
        const response = await fetch(mediaBlobUrl);
        const audioBlob = await response.blob();
    //   const formData = new FormData();
    //   formData.append("file", audioBlob, "audio.wav");
    //   formData.append("model", "whisper-1");

    console.log(audioBlob);
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });


    const  transcription = await openai.audio.transcriptions.create({
      file:  audioFile,
      model: "whisper-1",
      language: "en"
    });
    
    console.log(transcription.text);
    setQuestion(transcription.text);
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
           {mediaBlobUrl && (
              <div>
                <audio src={mediaBlobUrl} controls />
              </div>
            )}
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
        <div>
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
          <button
              className='action-btn'
                onClick= {
                  handleUploadAndTranscribe
                }
              >
                <Send size={16} />
                send audio
              </button>
      </div>
    </div>
  );
}

export default App;
