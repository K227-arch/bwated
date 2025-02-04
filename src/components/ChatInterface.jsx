import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Mic, Link, BookOpen} from 'lucide-react';
import Recording from '../components/Recording';
import './ChatInterface.css';
import OpenAI from "openai"; 



export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");

  const navigate  = useNavigate()

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

 
  const handleGenerate = async () => {
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

  function test(){
    navigate("/test")
  }
  const gotoUpload=()=>{
    navigate("/upload")
  }

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="message">
          <div className="avatar">AI</div>
          <div className="message-content">
            <p>Hello! I'm ready to help you with your PDF document. You can ask me questions or request specific information.</p>
          </div>
        </div>
        
        <div className="message user">
          <div className="message-content">
            <p>Can you summarize the main points of the document?</p>
            
          </div>
          
        </div>
      </div>
      
      <div className="action-bar">
        
        
        <div className="input-container">
          
          <Recording />
          <button className="send-btn" onClick={handleSend}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

