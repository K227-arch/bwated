import React, { useCallback } from "react";
import { Upload, FileText, Info, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { supabase } from '@/lib/supabaseClient';
import { canAffordTokens } from "./Calc";


const Sidebar = ({ isVisible, willHideSideNav }) => {
  const navigate = useNavigate();

  // Using useCallback to prevent unnecessary re-renders
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  //willShowSidebar according to width

  const sideBarWidth = isVisible ? "250px" : "0px";
  const sideBarLeftAnchor = isVisible ? "0px" : "-300px";

  const handleUploadClick = () => {
    // Clear existing PDF data
    localStorage.removeItem('extractedText');
    localStorage.removeItem('fileName');
    navigate('/upload');
  };

  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else { 
      const totalTokensUsed = parseInt(localStorage.getItem('totalTokensUsed')) || 0;
      await canAffordTokens(totalTokensUsed);
      localStorage.removeItem('docId');
      localStorage.removeItem('documentId');
      localStorage.removeItem('extractedText');
      localStorage.removeItem('fileName');
      localStorage.removeItem('totalTokensUsed');
      // console.log(canAfford)

      // Clear user session data
      localStorage.removeItem('userSession');
      // Navigate to the login page
      navigate('/login');
    }
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: sideBarWidth,
        left: sideBarLeftAnchor,
      }}
    >
      <div className="blind-element"></div>
      <div className="sidemenu-wrapper">
        <div className="section-1">
          <button className="nav-menu-ctrl-2" onClick={willHideSideNav}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-square-chevron-left"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="m14 16-4-4 4-4" />
            </svg>
          </button>
          <nav
            className="sidebar-nav"
            style={{
              visibility: isVisible ? "visible" : "hidden",
            }}
          >
            <button
              className="nav-btn"
              onClick={handleUploadClick}
              aria-label="Upload PDF"
            >
              <Upload size={20} />
              <div className="text">Upload a PDF</div>
            </button>
            <button
              className="nav-btn"
              onClick={goto("/dashboard")}
              aria-label="Documents"
            >
              <FileText size={20} />
              <div className="text">Dashboard</div>
            </button>
            <button
              className="nav-btn"
              onClick={goto("/home")}
              aria-label="Help"
            >
              <Info size={20} />
              <div className="text">Help</div>
            </button>
            <button
              className="nav-btn"
              onClick={goto("/plan")}
              aria-label="Subscription"
            >
              <CreditCard size={20} />
              <div className="text">My Subscription</div>
            </button>
          </nav>
        </div>

        <div className="down-buttons">
          <button
            className="nav-btn"
            onClick={handleLogout}
            aria-label="Log In"
          >
            <LogOut size={20} />
            <div className="text">Log Out</div>
          </button>
          <div className="feedback-section">
            <button
              className="feedback-btn"
              onClick={goto("/Feedback")}
              aria-label="Feedback"
            >
              Provide Feedback
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
