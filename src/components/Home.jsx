import React from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import "./Home.css";

const Home = ({ hideSideNav, isSideNavVisible }) => {


  const navigate  = useNavigate();

  function gotoDocumentChat(){
    navigate("/Documenttitle")
  }
  const features = [
    {
      icon: "⬆️",
      title: "Upload any content",
      description: "Upload the PDF content you would like to study.Bwated will scan and use the PDF to provide you with answers and questions to help you study."
    },
    {
      icon: "📝",
      title: "Test your knowledge",
      description: "Now you can ask Bwated questions about the topics in the PDF and it will provide relevant answers and provide more information to help you understand better."
    },
    {
      icon: "🎯",
      title: "Sources Included",
      description: "If you feel confident with your study session. Bwated cab test your knowledge with a test, which can customize to your standards."
    }
  ]

  return (
    <div className="container-home">
      <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <div className="home-word">
          <h1>Unlock the Power of AI in Learning with Bwated</h1>
          <p>Personalized, AI-driven education tailored to your learning style.</p>
        </div>
      <div className="features">
        
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="icon">{feature.icon}</div>
            <h2 className="feature-title">{feature.title}</h2>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
};

export default Home;
