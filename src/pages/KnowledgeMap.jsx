import React, { useState } from 'react';

export default function KnowledgeMap({ trustedSources, flaggedSources, setTrustedSources, setFlaggedSources }) {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState('trusted');

  const addSource = () => {
    const name = newSourceName.trim();
    if (!name) return;
    const newEntry = { id: Date.now(), name };
    if (newSourceType === 'trusted') {
      setTrustedSources([...trustedSources, newEntry]);
    } else {
      setFlaggedSources([...flaggedSources, newEntry]);
    }
    setNewSourceName('');
  };

  const removeTrusted = (id) => setTrustedSources(trustedSources.filter(s => s.id !== id));
  const removeFlagged = (id) => setFlaggedSources(flaggedSources.filter(s => s.id !== id));

  return (
    <section className="view active">
      <header className="view-header">
          <h1>Knowledge Map</h1>
          <p>Database of news sources and their credibility ratings. AI uses this to evaluate source risk.</p>
      </header>

      <div className="knowledge-grid">
          <div className="glass-panel">
              <h3><i className="ri-shield-check-fill text-success"></i> Trusted Sources</h3>
              <ul className="source-list">
                {trustedSources.map(source => (
                  <li key={source.id}>
                    <span>{source.name}</span> 
                    <button className="delete-btn" onClick={() => removeTrusted(source.id)}><i className="ri-close-line"></i></button>
                  </li>
                ))}
              </ul>
          </div>
          <div className="glass-panel">
              <h3><i className="ri-error-warning-fill text-danger"></i> Flagged Sources</h3>
              <ul className="source-list">
                {flaggedSources.map(source => (
                  <li key={source.id}>
                    <span>{source.name}</span> 
                    <button className="delete-btn" onClick={() => removeFlagged(source.id)}><i className="ri-close-line"></i></button>
                  </li>
                ))}
              </ul>
          </div>
          <div className="glass-panel">
              <h3><i className="ri-add-circle-line text-accent"></i> Add Source</h3>
              <div className="add-source-form">
                  <input type="text" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Source Name" />
                  <select value={newSourceType} onChange={e => setNewSourceType(e.target.value)}>
                      <option value="trusted">Trusted</option>
                      <option value="flagged">Flagged</option>
                  </select>
                  <button onClick={addSource} className="btn-primary">Add Source</button>
              </div>
          </div>
      </div>
    </section>
  );
}
