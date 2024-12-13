import React from 'react';
import { Upload, FileText, Settings, MessageSquare } from 'lucide-react';
import './Sidebar.css';
import { useNavigate } from "react-router";

const Sidebar = () => {


  const navigate  = useNavigate()

  const gotoPDFViewer=()=>{
    navigate("/PDFViewer")
  }
  const gotoDocumentchat=()=>{
    navigate("/Documentchat")
  }


  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">MY KASASI</h1>
      </div>
      
      <nav className="sidebar-nav">
        <button className="upload-btn">
          <Upload size={20} />
          Upload a PDF
        </button>
        
        <div>
          <button className="nav-btn" onClick={gotoPDFViewer}>
            <FileText size={20} />
            Documents
          </button>
          <button className="nav-btn" onClick={gotoDocumentchat}>
            <MessageSquare size={20} />
            Chats
          </button>
          <button className="nav-btn">
            <Settings size={20} />
            Settings
          </button>
        </div>
      </nav>
      Help us Make Kasasi Better
      <div className="feedback-section">
        <button className="feedback-btn">
          Provide Feedback
        </button>
      </div>
    </aside>
  );
}

export default Sidebar