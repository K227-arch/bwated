import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './plan.css';

const plan = () => {


  const navigate  = useNavigate()

  function gotoDocumenttitle(){
    navigate("/Documenttitle")
  }

  return (
    <div>
      <div className="plan">
        <div className="title">
            MY KASASI
        </div>
        <hr></hr>
        <div className="subtitle">
            <h1>Choose your plan</h1>
        </div>
        
        <div className="container1">
            <div className="container2">
             <div className="main">
               <h3>Free trial</h3> 
             </div>
             
            <p>Still not sure? Try it out for a limited time period with all features.</p>
            <h1>UGX 0</h1> per month.
            <button className="start" onClick={gotoDocumenttitle}>
  Current Plan
</button>
            <ul>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
            </ul>
            
            
        </div>
        <div className="container2">
            <div className="main">
               <h3>Premium</h3> 
            </div>
            
            <p>Get the full experience with all the latest tools and features.</p>
            <h1>UGX 50,000 </h1>per month
            <button className="start">
                Subscribe
            </button>
            <ul>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
                <li>Feature 1</li>
            </ul>
            
        </div>
        </div>
        
      </div>
    </div>
  )
}

export default plan
