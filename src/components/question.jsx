import React from 'react';
import { useState } from 'react';
import './question.css';
import { useLocation } from 'react-router-dom';


function  Question() {

  const data  = useLocation();
  console.log("rec",data.state)
  

  const questions = [
    {
      question: "What is one of the core focuses of the React Native Fundamentals section?",
      options: [
        "A. Implementing third party tools for authentication",
        "B. Creating pixel-perfect UIs for both iOS and Android devices",
        "C. Building desktop applications only",
        "D. Learning the HTML structure for mobile apps"
      ]
    },
    // More questions would be generated based on selected topics
  ];


  return (
    <div className="test-screen">
      <div className="test-header">
        <button className="back-button">← Back to start</button>
        
      </div>
        
        
      </div>
   
  );
}

export default Question;