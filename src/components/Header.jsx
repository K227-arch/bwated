import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CircleUser, Settings } from 'lucide-react';
import './Header.css';

import logo from '../assets/logo.png';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const gotoPDFViewer =()=>navigate('/Upload')
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="auth-buttons" ref={dropdownRef}>
      <Settings size={30} className="setting-btn" onClick={gotoPDFViewer}/>
      <CircleUser size={35} className="circle-btn" onClick={() => setIsOpen((prev) => !prev)} />
      {isOpen && (
        <div className="dropdown-menu">
          <div className="menu-header">
            <img
              src="https://via.placeholder.com/60"
              alt="Profile"
              className="menu-profile-image"
            />
            <div className="user-info">
              <h4>John Doe</h4>
              <p>john.doe@example.com</p>
            </div>
          </div>
          <ul className="menu-items">
            
           
            <li>
              <a href="#logout" className="logout">
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
       <div className="logo">
           <img src={logo} className="logo" alt="Logo"/>
       </div>  
      
          
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
