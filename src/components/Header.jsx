import React from 'react';
import { Menu } from 'lucide-react';
import './Header.css';
import { useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate()
  const gotoLogin=()=>{
    navigate("/")
  }
  const gotoSignup=()=>{
    navigate("/")
  }


  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          
          MY KASASI
        </a>
       <div className="auth-buttons">
          <button className="btn btn-login" onClick={gotoLogin}>Log in</button>
          <button className="btn btn-signup" onClick={gotoSignup}>Sign up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;