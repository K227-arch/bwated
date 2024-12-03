import React from 'react';
import { Search, User, Bell } from 'lucide-react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h3>MY KASASI</h3>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search documents..."
            className="search-input"
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="header-actions">
          <button className="header-btn">
            <Bell size={20} />
          </button>
          <button className="header-btn">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}