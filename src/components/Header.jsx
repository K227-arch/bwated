import React from 'react';
import { Search, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            placeholder=""
            className="search-input"
          />
          <Search className="search-icon" size={20} />
        </div>

        <div className="header-actions">
          <button className="header-btn">
            <Settings size={20} />
          </button>
          {/* Redirects to the Plan page */}
          <Link to="/plan">
            <button className="header-btn">
              <User size={20} />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
