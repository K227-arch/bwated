import React from 'react';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'
import './dashboard.css';
import { useNavigate } from "react-router";


function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate=useNavigate()
  const gotoDocumentchat=()=>{
    navigate("/Documentchat")
  }
  return (
    <div className="layout">
      <div className="layout-main">
        <Header />
      </div>

      <div className="chat-container2">
      <header className="chat-header">
        <h1>Good morning, Abba</h1>
        <button className="new-chat-btn" onClick={gotoDocumentchat}>
          <div className="icon2">📝</div>
            Start a new chat
        </button>
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