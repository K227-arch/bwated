import React from "react";
import { useNavigate } from "react-router";
import kisasi from "../assets/kisasi.jpg";
import "./signup.css";


const signup =()=> {
  const navigate = useNavigate()
const gotoPlan=()=>{
  navigate("/Plan")
}
  return (
    <div>
      <div className="login-wrapper2">
        <div className="container">
          MY KASASI
          <p>
            <h1>Enter Password</h1>
          </p>
          <div className="formbutton2">
            <form>
              <input
                type="email"
                placeholder="Enter Password"
                className="google-input-with-icon2"
                required
              />
              <div className="or"></div>
              <input
                type="email"
                placeholder="Confirm Password"
                className="email-input2"
                required
              />
            </form>
          </div>
          <button type="submit" class="submitbutton2" onClick={gotoPlan}>
            Set password
          </button>
        </div>
        <img src={kisasi} alt="Img" />
      </div>
    </div>
  );
}

export default signup;
