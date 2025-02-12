import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout.jsx";
import ChatInterface from "./ChatInterface.jsx";
import Pop from "./Pop.jsx";
import "./Documentchat.css";

function App({ children, hideSideNav, isSideNavVisible }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if PDF content exists
    const pdfContent = localStorage.getItem('extractedText');
    const fileName = localStorage.getItem('fileName');

    if (!pdfContent || !fileName) {
      // If no PDF content, redirect to upload
      navigate('/upload');
    }
  }, [navigate]);

  return (
    <div className="layout">
      <Pop />
      <div className="layout-main">
        <Layout isSideNavVisible={isSideNavVisible} hideSideNav={hideSideNav} />
      </div>
      <div className="layoutmain2">
        <ChatInterface isNavVisible={isSideNavVisible} />
      </div>

      <main className="layout-content">{children}</main>
    </div>
  );
}

export default App;
