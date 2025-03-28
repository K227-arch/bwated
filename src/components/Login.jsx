import React from "react";
import { useNavigate } from "react-router-dom";
import kisasi from "../assets/kisasi.jpg";
import logo from '../assets/logo.png';
import "./login.css";
import { useState } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer, toast } from 'react-toastify';
import { useEffect } from "react";
function Login() {
   const [login_email, setLoginEmail] = useState('');
   const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
 
  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    checkSession();
  }, []); 

  
  const SignInGoogle = async () => {
    const { user, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/dashboard',  
      },
    });

    console.log(user)

    if (error) {
      toast(error.message);
      console.error("Google sign-in error:", error.message);
    } else {
      console.log("Google sign-in successful!", user);
      navigate("/dashboard");
    }
  }

  const signInWithEmail = async (email, password) => {
    validateEmail(email)
    console.log(email, password)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
        if (error) {
          toast(error.message);
          console.error("Sign-in error:", error.message);
        } else {
          console.log(data.id)
          sessionStorage.setItem("user", (data.user));
          console.log("Sign in successful!", data.user);
          navigate("/dashboard");
        }
      };

  

  return (
    <div>
      <ToastContainer />
      <div className="login-wrapper">
        <div className="container-login">
          <div className="logologin">
            <img src={logo} className="login-logo" onClick={ () => navigate('/')} alt="Logo"/>
          </div>
          
          <p>
            <h1>Your Learning, supercharged</h1>
          </p>
          <p>
            <h5>The AI platform built to help you study faster.</h5>
          </p>
          
          <div className="formbutton">
            {/* login form */}
            <div className="cl-wrapper">
                <input type="email" placeholder="Email" className="email-input" onChange={(e) => setLoginEmail(e.target.value)} />
                <input type="password" placeholder="Password" className="email-input2" onChange={(e) => setPassword(e.target.value)} />

                <button type="submit" className="submitbutton2" onClick={() => signInWithEmail(login_email, password)}>Sign In</button>
            </div>

            <div className="or">OR</div> 


            <button className="google-input-with-icon" onClick={SignInGoogle}>
                Continue With Google
              </button>
          </div>
          
        <p>
          <span>Have an account? </span>
          <a href="/signup" className="signup-button" >Sign Up</a>
        </p>
        </div>
      </div>
    </div>
  );
}

export default Login;