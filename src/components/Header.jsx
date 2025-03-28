import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, BellRing } from "lucide-react";
import "./Header.css";
import logo from "../assets/bwated.png";
import { supabase } from '@/lib/supabaseClient'; // Import supabase client
import { canAffordTokens } from "./Calc";

 const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // State to hold user details
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: userData, error } = await supabase.auth.getUser(); // Fetch logged-in user details
      if (error) {
        console.error('Error fetching user details:', error);
      } else {
        setUser(userData); // Set user details in state
        // console.log(user.user.user_metadata)
      }
    };

    fetchUserDetails(); // Call the function to fetch user details
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Perform the logout using Supabase
      const totalTokensUsed = parseInt(localStorage.getItem('totalTokensUsed')) || 0;
      await canAffordTokens(totalTokensUsed);
      localStorage.removeItem('docId');
      localStorage.removeItem('documentId');
      localStorage.removeItem('extractedText');
      localStorage.removeItem('fileName');
      localStorage.removeItem('totalTokensUsed');

      navigate('/') // Notify user of successful logout
    } catch (error) {
      console.error('Error logging out:', error);
      alert("An error occurred while logging out."); // Notify user of error
    }
    setIsOpen(false);
  };

  return (
    <div className="auth-buttons" ref={dropdownRef}>
      <BellRing 
       size={30}
       className="circle-btn2"
       aria-label="Open profile menu" />
      <CircleUser
        size={35}
        className="circle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open profile menu"
      />
      {isOpen && (
        <div className="dropdown-menu">
          <div className="menu-header">
            <img
              src={user.user.user_metadata.avatar_url}
              alt="Profile"
              className="menu-profile-image"
            />
            <div className="user-info">
              <h4>{user ? user.user.user_metadata.full_name : 'Loading...'}</h4>
              <p>{user ? user.user.user_metadata.email : 'Loading...'}</p>
            </div>
          </div>
          <ul className="menu-items">
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  return (
    <header className="header">
      <div className="header-container">
        
        <div className="logo-header">
          <img
            src={logo}
            className="header-logo"
            onClick={goto("/Dashboard")}
            alt="Logo"
            aria-label="Go to home"
          />
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
