import React from 'react';

export default function Sidebar({ activeView, setActiveView, openSettings, openEthics }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <i className="ri-shield-check-fill glow-icon"></i>
          <h2>FakeShield<span className="dot">.</span>AI</h2>
        </div>
      </div>
      
      <ul className="nav-links">
        <li 
          className={`nav-item ${activeView === 'analyzer' ? 'active' : ''}`} 
          onClick={() => setActiveView('analyzer')}
        >
          <i className="ri-search-eye-line"></i>
          <span>Analyzer</span>
        </li>
        <li 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveView('dashboard')}
        >
          <i className="ri-dashboard-line"></i>
          <span>Dashboard</span>
        </li>
        <li 
          className={`nav-item ${activeView === 'knowledge' ? 'active' : ''}`} 
          onClick={() => setActiveView('knowledge')}
        >
          <i className="ri-mind-map"></i>
          <span>Knowledge Map</span>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="ethics-trigger" onClick={openSettings}>
          <i className="ri-settings-3-line"></i>
          <span>API Settings</span>
        </div>
        <div className="ethics-trigger" onClick={openEthics}>
          <i className="ri-information-line"></i>
          <span>AI Ethics & Rules</span>
        </div>
      </div>
    </nav>
  );
}
