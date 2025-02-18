import React from 'react';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'
import './dashboard.css';
import { useNavigate } from "react-router";


function App({hideSideNav,isSideNavVisible}) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate=useNavigate()
  const gotoDocumentchat=()=>{
    navigate("/Documentchat")
  }
 
  const handleChatClick = () => {
     navigate("/upload")
  }

  const handleTestClick = () => {
    navigate("/Test")
  }
  return (
    <div className="layout">
      <div className="layout-main">
        <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav}/>

      </div>

      <div className="chat-container2-dashboard">
      <header className="chat-header">
        <h1>Good morning, Abba</h1>
        {/* <button className="new-chat-btn" onClick={gotoDocumentchat}>
          <div className="icon2">📝</div>
            Start a new chat
        </button> */}

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
      </header>

      <div className="filter-section">
        <div className="filter-buttons">
          <button className="filter-btn active">PDFs & Quizzes</button>
          
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input4"
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="sort-dropdown">
          <select className="sort-select">
            <option>Most recent</option>
          </select>
        </div>
      </div>

      <div className="chat-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="chat-card">
            <div className="chat-preview">
              <h3>Untitled</h3>
              <div className="date">12/31/1969</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
export default App;