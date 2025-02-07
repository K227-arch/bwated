import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Send, Mic, Link, BookOpen } from "lucide-react";
import Recording from "../components/Recording";
import "./ChatInterface.css";

export default function ChatInterface({isNavVisible}) {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  function test() {
    navigate("/test");
  }
  const gotoUpload = () => {
    navigate("/upload");
  };

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="boundary-sidebar" style={{
        display  : !isNavVisible ? "none"  : "block"
      }}></div>
      <div className="boundary-wrapper">
        <div className="chat-messages">
          <div className="message">
            <div className="avatar">AI</div>
            <div className="message-content">
              <p>
                Hello! I'm ready to help you with your PDF document. You can ask
                me questions or request specific information.
              </p>
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
    </div>
  );
}
