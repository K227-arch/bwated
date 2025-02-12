import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Recording from "../components/Recording";
import "./ChatInterface.css";
import OpenAI from "openai"; 
import axios from "axios";


export default function ChatInterface({ isNavVisible }) {
  const [pdfContent, setPdfContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioText, setCurrentAudioText] = useState('');

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });


  const [canActivateSideBarContentPush, activateSideBarPush] = useState(true);

  const sideBarMediaQuery = window.matchMedia("(max-width:704px)");

  sideBarMediaQuery.onchange = (ev) => {
    if (ev.matches) {
      activateSideBarPush(false);
    } else {
      activateSideBarPush(true);
    }
  };
  

  const willBeAbleToPushContentWithSideBar = canActivateSideBarContentPush && isNavVisible;

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  function test() {
    navigate("/test");
  }
  const gotoUpload = () => {
    navigate("/upload");
  };

  useEffect(() => {
    // Load PDF content and filename when component mounts
    const content = localStorage.getItem('extractedText');
    const storedFileName = localStorage.getItem('fileName');
    
    if (content) {
      setPdfContent(content);
      setFileName(storedFileName || 'Uploaded PDF');
      
      // Initialize chat with system message
      setChatHistory([{
        role: 'system',
        content: `I'm analyzing the PDF "${storedFileName}". How can I help you understand it better?`
      }]);
    } else {
      setError('No PDF content found. Please upload a document first.');
      navigate('/upload');
    }
  }, []);

  
  const readAIResponseAloud = async (responseText) => {
    try {
      // Stop any currently playing audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: responseText,
      });

      const buffer = await mp3.arrayBuffer();
      const audioBlob = new Blob([buffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const newAudio = new Audio(audioUrl);
      
      // Set up audio event listeners
      newAudio.addEventListener('play', () => setIsPlaying(true));
      newAudio.addEventListener('pause', () => setIsPlaying(false));
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudioText('');
      });

      setAudio(newAudio);
      setCurrentAudioText(responseText);
      newAudio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error generating speech:", error);
      alert("An error occurred while generating speech.");
    }
  };

  const handlePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleQuestionSubmit = async (recordedQuestion) => {
    if (!recordedQuestion?.trim()) return;

    const newUserMessage = { role: 'user', content: recordedQuestion };
    setChatHistory(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are analyzing the following PDF content: "${pdfContent}". 
                       Answer questions based solely on this content.`
            },
            ...chatHistory,
            newUserMessage
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const aiResponse = response.data.choices[0].message;
      setChatHistory(prev => [...prev, aiResponse]);
      
      // Automatically read the AI response
      await readAIResponseAloud(aiResponse.content);
      
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prev => [...prev, {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const HandleQn = (recordedQuestion) => {
    handleQuestionSubmit(recordedQuestion);
  }

  return (
    <div className="chat-container">
      <div
        className="boundary-sidebar"
        style={{
          display: willBeAbleToPushContentWithSideBar ? "block" : "none"
        }}
      ></div>
      <div className="boundary-wrapper">
        <div className="chat-header">
          <h2>{fileName}</h2>
        </div>
        <div className="chat-messages">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? '👤' : msg.role === 'system' ? '🔔' : '🤖'}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.role === 'assistant' && msg.content === currentAudioText && (
                  <div className="audio-controls">
                    <button onClick={handlePlayPause}>
                      {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="message-content">
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="action-bar">
          <div className="input-container">
            <Recording 
              setQns={handleQuestionSubmit}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              hasAudio={!!audio}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
