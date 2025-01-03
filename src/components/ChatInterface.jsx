import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Mic, Link, BookOpen} from 'lucide-react';
import './ChatInterface.css';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const navigate  = useNavigate()
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
        <div className="action-buttons">
          <button className="action-btn">
            <Mic size={16} />
            Voice Chat
          </button>
          <button className="action-btn" onClick={test}>
            <BookOpen size={16} />
            Take Test
          </button>
          <button className="action-btn" onclick={gotoUpload}>
            <Link size={16} />
            Attach files
          </button>
          
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSend}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

