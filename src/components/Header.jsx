import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUser } from 'lucide-react';
import './Header.css';
import logo from '../assets/logo.png';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    alert('Logging out...'); // Replace with actual logout logic
    setIsOpen(false);
  };

  return (
    <div className="auth-buttons" ref={dropdownRef}>
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
        <div className="logo">
          <img
            src={logo}
            className="header-logo"
            onClick={goto('/Documenttitle')}
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

