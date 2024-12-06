import React from 'react';
import kisasi from '../assets/kisasi.jpg';
import './signup.css';

function login() {
  return (
    <div>

      <div className="login-wrapper2">
        <div className="container">
        MY KASASI
        <p><h1>Enter Password</h1></p>
        
        <div className="formbutton2">
          <form>
          <input
            type="email"
            placeholder="Enter Password"
            class="google-input-with-icon2"
            required
           />
           <div className="or">
              
            </div>
           <input
            type="email"
            placeholder="Confirm Password"
            class="email-input2"
            required
           />
           
           
           </form>
        </div>
        <button type="submit" class="submitbutton2">Set password</button>
       </div>
       <img src={kisasi} alt="Img" />
      </div>
      
      
        
    
    </div>
  )
}

export default login