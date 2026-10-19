import React from 'react';
import logo from '../disha-logo.jpg';

export default function Header() {
  return (
    <header className="glass-panel header">
      <div className="brand-section">
        <img src={logo} alt="Disha Logo" className="brand-logo-img" />
        <div className="brand-text">
          <h1>Disha</h1>
          <span className="brand-tagline">
            Clear Direction for Your Next Big Step &bull; Undergraduate Eligibility Engine
          </span>
        </div>
      </div>
      <div className="header-status">
        <div className="status-pill">
          <span className="status-dot"></span>
          <span>Java Backend Active</span>
        </div>
      </div>
    </header>
  );
}
