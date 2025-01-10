import React, { useState, useRef, useEffect } from 'react';
import { CircleUser } from 'lucide-react';
import './Header.css';
import { useNavigate } from 'react-router';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        <a href="/" className="logo">
          MY KASASI
        </a>
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
