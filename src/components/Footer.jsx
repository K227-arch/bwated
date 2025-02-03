import React from 'react';
import logo from '../assets/bwated-white.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo">
            <img src={logo} className="footer-logo" alt="Logo"/>
          </div>
          <p className="brand-description">
            The premier AI-driven platform for personalized learning and practice tests
          </p>
          
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><a href="/blog">FAQ</a></li>
              <li><a href="/ambassador">Features</a></li>
              <li><a href="/shop">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/imprint">Imprint</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Bwarted inc.</p>
      </div>
    </footer>
  );
};

export default Footer;