import React from "react";
import { useNavigate } from "react-router-dom";
import kisasi from "../assets/kisasi.jpg";
import logo from '../assets/logo.png';
import "./login.css";
import { useState } from 'react';
import { supabase } from "@/lib/supabaseClient";

function Login() {
  const [email, setEmail] = useState('');
  const [login_email, setLoginEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function navigateToPlanPage() {
    if (email.trim() === '') {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    navigate("/Signup", {
      state: {
        email: email.trim()
      }
    });
  }

  const signInWithEmail = async (email, password) => {
    validateEmail(email)
    console.log(email, password)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
        if (error) {
          console.error("Sign-in error:", error.message);
        } else {
          console.log("Sign in successful!", data);
          // navigate("/Documenttitle");
        }
      };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  return (
    <div>
      <div className="login-wrapper">
        <div className="container-login">
          <div className="logologin">
            <img src={logo} className="login-logo" alt="Logo"/>
          </div>
          
          <p>
            <h1>Your Learning, supercharged</h1>
          </p>
          <p>
            <h5>The AI platform built to help you study faster.</h5>
          </p>
          
          <div className="formbutton">
            {/* login form */}
            <div>
                <input type="email" placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                <button onClick={() => signInWithEmail(login_email, password)}>Sign In</button>
            </div>
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
              <button className="google-input-with-icon" required>
                Continue With Google
              </button>
              <div className="or">OR</div>
              <input
                type="email"
                placeholder="Enter your email address"
                className="email-input"
                required
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <span className="error-message">{emailError}</span>}
            </form>
          </div>
          
          <button 
            type="submit" 
            className="submitbutton2" 
            onClick={navigateToPlanPage}
          >
            Continue with email
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;