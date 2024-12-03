import React from 'react';
import kisasi from '../assets/kisasi.jpg';
import './login.css';

function login() {
  return (
    <div>

      <div className="login-wrapper">
        <div className="container">
        MY KASASI
        <p><h1>Your Learning, supercharged</h1></p>
        <p><h5>The AI platform built to help you study faster.</h5></p>
        <div className="formbutton">
          <form>
          <input
            type="email"
            placeholder="Continue With Google"
            class="google-input-with-icon"
            required
           />
           <div className="or">
              OR
            </div>
           <input
            type="email"
            placeholder="Enter your email address"
            class="email-input"
            required
           />
           
           
           </form>
        </div>
        <button type="submit" class="submit-button">Continue with email</button>
       </div>
       <img src={kisasi} alt="Img" />
      </div>
      
      
        
    
    </div>
  )
}

export default login
