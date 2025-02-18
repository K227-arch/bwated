import { useState } from "react";
import "./Recording.css";
import { useNavigate } from 'react-router-dom';
import OpenAI from "openai";
import { ReactMediaRecorder, useReactMediaRecorder } from "react-media-recorder";
import { ArrowRight, Send, Mic, Link, BookOpen } from 'lucide-react';

function App({ setQns, isPlaying, onPlayPause, hasAudio, isLoading }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  const handlePausePlay = () => {
    setIsPaused(!isPaused);
    onPlayPause();
  }

  const handleUploadAndTranscribe = async () => {
    setTranscribing(true);
    setError(null);
    try {
      const response = await fetch(mediaBlobUrl);
      const audioBlob = await response.blob();
      const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en"
      });

      setTranscribedText(transcription.text);
      setQns(transcription.text);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error.message || 'Failed to transcribe audio');
    } finally {
      setTranscribing(false);
    }
  };

  const navigate = useNavigate()
  const gotoTest = () => {
    navigate('/test')
  }

  return (
    <div className="chat-container2">
      <div className="listening-section">
        <div className="listening-text">
          {status === 'recording' ? 'Recording...' : 
           transcribing ? 'Transcribing...' : 
           'Ready to record'}
        </div>
        {hasAudio && (
          <>
            <div className="waveform">
              {[...Array(25)].map((_, index) => (
                <div
                  key={index}
                  className={`wave-bar ${status === 'recording' ? "active" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                ></div>
              ))}
            </div>
          </>
        )}

        {/* {transcribedText && !error && (
          <div className="transcribed-text">
            <p>Transcribed: {transcribedText}</p>
          </div>
        )} */}

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>

      <div className="controls">
        <button 
          className="control-btn text-chat"
          disabled={isLoading || transcribing}
        >
          <span5 className="chat-icon">💬</span5>
          Text Chat
        </button>
        <button 
          className="control-btn quiz-mode" 
          onClick={gotoTest}
          disabled={isLoading || transcribing}
        >
          <span5 className="quiz-icon">🎲</span5>
          Quiz Mode
        </button>

        

        <div className="control-btn">
          {status === 'recording' ? (
            <button 
              className="action-btn"
              onClick={stopRecording}
              disabled={isLoading || transcribing}
            >
              <Mic size={16} />
              Stop Recording
            </button>
          ) : (
            <button 
              className="action-btn" 
              onClick={startRecording}
              disabled={isLoading || transcribing}
            >
              <Mic size={16} />
              Voice Chat
            </button>
          )}
        </div>

        {hasAudio && (
          <button
            className="control-btn pause"
            onClick={handlePausePlay}
            disabled={isLoading || transcribing}
          >
            {isPaused ? "▶️ Play" : "⏸️ Pause"}
          </button>
        )}

        {mediaBlobUrl && (
          <button
            className='action-btn'
            onClick={handleUploadAndTranscribe}
            disabled={isLoading || transcribing}
          >
            <Send size={16} />
            {transcribing ? 'Transcribing...' : 'Send Recording'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
