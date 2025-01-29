import React from "react";
import { useNavigate } from "react-router-dom";
import kisasi from "../assets/kisasi.jpg";
import logo from '../assets/logo.png';
import "./login.css";

function Login() {


  const navigate = useNavigate()


  function navigateToPlanPage(){
      navigate("/Signup")
  }


  return (
    <div>
      <div className="login-wrapper">
        <div className="logologin">
            <img src={logo} className="logo" alt="Logo"/>
          </div>
        <div className="container">
          
          

          <p>
            <h1>Your Learning, supercharged</h1>
          </p>
          <p>
            <h5>The AI platform built to help you study faster.</h5>
          </p>
          <div className="formbutton">
            <form>
              <input
                
                placeholder="Continue With Google"
                class="google-input-with-icon"
                required
              />
              <div className="or">OR</div>
              <input
                type="email"
                placeholder="Enter your email address"
                class="email-input"
                required
              />
            </form>
          </div>
          
            <button type="submit" className="submitbutton" onClick={navigateToPlanPage}>
              Continue with email
            </button>
          
        </div>
        <img src={kisasi} alt="Img" />
      </div>
    </div>
  );
}

export default Login;
