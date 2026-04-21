import React, { useState, useEffect } from 'react';
import SettingsModal from './components/SettingsModal';
import EthicsModal from './components/EthicsModal';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import KnowledgeMap from './pages/KnowledgeMap';
import Ethics from './pages/Ethics';
import { KNOWLEDGE_BASE } from './utils/knowledgeBase';

function App() {
  const [activeView, setActiveView] = useState('analyzer');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('fakeshield_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [trustedSources, setTrustedSources] = useState([
      { id: 1, name: 'BBC News' }, { id: 2, name: 'CNN' }, { id: 3, name: 'Reuters' },
      { id: 4, name: 'CNBC' }, { id: 5, name: 'NBC News' }, { id: 6, name: 'WHO' },
      { id: 7, name: 'NASA' }, { id: 8, name: 'NOAA' }, { id: 9, name: 'ISRO' },
      { id: 10, name: 'AP News' }, { id: 11, name: 'NYT' }, { id: 12, name: 'The Guardian' },
      { id: 13, name: 'Al Jazeera' }
  ]);
  
  const [flaggedSources, setFlaggedSources] = useState([
      { id: 14, name: 'FABRICATED sources' },
      { id: 15, name: 'Viral social media' },
      { id: 16, name: 'Unknown blogs' },
      { id: 17, name: 'Conspiracy websites' },
      { id: 18, name: 'Satire sites' }
  ]);

  // HARDCODE YOUR WEBHOOK URL HERE SO IT IS PERMANENT FOR THE WHOLE GROUP
  const [webhookUrl] = useState('http://localhost:5678/webhook/fakeshield-submit');
  const [showEthicsModal, setShowEthicsModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('fakeshield_history', JSON.stringify(history));
  }, [history]);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-links">
          <li className={`nav-item ${activeView === 'analyzer' ? 'active' : ''}`} onClick={() => setActiveView('analyzer')}>Analyzer</li>
          <li className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</li>
          <li className={`nav-item ${activeView === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveView('knowledge')}>Knowledge Map</li>
          <li className={`nav-item ${activeView === 'ethics' ? 'active' : ''}`} onClick={() => setActiveView('ethics')}>Ethics</li>
        </div>
      </nav>

      <main className="content-area">
        <header className="view-header">
          <h1>FakeShield<span style={{color:'var(--secondary)'}}> // </span>AI</h1>
          <div className="typing-text">Analyzing credibility since 2024...</div>
        </header>

        {activeView === 'analyzer' && (
          <Analyzer 
            webhookUrl={webhookUrl}
            knowledgeBase={KNOWLEDGE_BASE}
            trustedSources={trustedSources}
            flaggedSources={flaggedSources}
            addHistoryItem={(item) => setHistory([item, ...history])}
          />
        )}
        {activeView === 'dashboard' && (
          <Dashboard history={history} setHistory={setHistory} />
        )}
        {activeView === 'knowledge' && (
          <KnowledgeMap 
            trustedSources={trustedSources}
            flaggedSources={flaggedSources}
            setTrustedSources={setTrustedSources}
            setFlaggedSources={setFlaggedSources}
          />
        )}
        {activeView === 'ethics' && <Ethics />}
      </main>
    </div>
  );
}

export default App;
