import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Settings,
  Info,
  CreditCard,
  LogOut,
  Accessibility,
  Share,
  Moon,
  Menu,
} from 'lucide-react';
import './Sidebar.css';
import { useNavigate } from 'react-router';

const Sidebar = () => {
  const navigate = useNavigate();
  

  const gotoPDFViewer = () => navigate('/dashboard');
  const gotoHome = () => navigate('/Home');
  const gotoUpload = () => navigate('/Upload');
  const gotoSubscribe = () => navigate('/Plan');
  const gotoLogin = () => navigate('/Adminside');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">MY KASASI</h1>
      </div>
      <nav className="sidebar-nav">
      
        <button className="upload-btn" onClick={gotoUpload}>
          <Upload size={20} />
          <div className="text">Upload a PDF</div>
        </button>
        <div>
          <button className="nav-btn" onClick={gotoPDFViewer}>
            <FileText size={20} />
            <div className="text">Documents</div>
          </button>
          <button className="nav-btn" onClick={gotoHome}>
            <Info size={20} />
            <div className="text">Help</div>
          </button>
          
          
          <button className="nav-btn" onClick={gotoSubscribe}>
            <CreditCard size={20} />
            <div className="text">My Subscription</div>
          </button>
        </div>
      </nav>
      <div className="down-buttons">
        <button className="nav-btn" onClick={gotoLogin}>
          <LogOut size={20} />
          <div className="text">Log In</div>
        </button>
        <p>Help us Make Kasasi Better</p>
        <div className="feedback-section">
          <button className="feedback-btn">Provide Feedback</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

