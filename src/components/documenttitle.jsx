import { useState,react } from 'react'
import './documenttitle.css'
import Header from './Header'
import { useNavigate } from "react-router-dom";

function App() {
  const [showChat, setShowChat] = useState(false)
  const [showTest, setShowTest] = useState(false)

  const navigate = useNavigate();

  const handleChatClick = () => {
     navigate("/Documentchat")
  }

  const handleTestClick = () => {
    navigate("/Test")
  }

  return (
    
    <div className="container4">
      <div className="layout-main">
        <Header />
      </div>
      <h1 className="title2"></h1>
      
      <div className="cards-container">
        <div className="card" onClick={handleChatClick}>
          <div className="card-icon">💬</div>
          <h2>Start a Chat</h2>
          <p>Need to study? Enter a chat and ask about anything you're not sure about.</p>
        </div>

        <div className="card" onClick={handleTestClick}>
          <div className="card-icon">📝</div>
          <h2>Take a Test</h2>
          <p>Feeling confident? Test your knowledge with some multiple choice questions.</p>
        </div>
      </div>

      <p className="terms">
        By uploading a document, you agree to and have read our{' '}
        <a href="#" className="terms-link">Terms and Conditions</a>.
      </p>
    </div>
  )
}

export default App