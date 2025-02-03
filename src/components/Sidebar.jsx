import React, { useCallback } from 'react';
import { Upload, FileText, Info, CreditCard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  // Using useCallback to prevent unnecessary re-renders
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  return (
    <aside className="sidebar">
      
      <nav className="sidebar-nav">
        <button className="nav-btn" onClick={goto('/upload')} aria-label="Upload PDF">
          <Upload size={20} />
          <div className="text">Upload a PDF</div>
        </button>
        <button className="nav-btn" onClick={goto('/dashboard')} aria-label="Documents">
          <FileText size={20} />
          <div className="text">Dashboard</div>
        </button>
        <button className="nav-btn" onClick={goto('/home')} aria-label="Help">
          <Info size={20} />
          <div className="text">Help</div>
        </button>
        <button className="nav-btn" onClick={goto('/plan')} aria-label="Subscription">
          <CreditCard size={20} />
          <div className="text">My Subscription</div>
        </button>
      </nav>
      <div className="down-buttons">
        <button className="nav-btn" onClick={goto('/adminside')} aria-label="Log In">
          <LogOut size={20} />
          <div className="text">Log In</div>
        </button>
        <p>Help us Make Kasasi Better</p>
        <div className="feedback-section">
          <button className="feedback-btn" onClick={goto('/Feedback')} aria-label="Feedback">Provide Feedback</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


