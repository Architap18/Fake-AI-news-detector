import React, { useState } from 'react';

export default function SettingsModal({ close, groqApiKey, setGroqApiKey, webhookUrl, setWebhookUrl }) {
  const [localGroqKey, setLocalGroqKey] = useState(groqApiKey);
  const [localWebhook, setLocalWebhook] = useState(webhookUrl);

  const handleSave = () => {
    localStorage.setItem('groqApiKey', localGroqKey);
    localStorage.setItem('webhookUrl', localWebhook);
    setGroqApiKey(localGroqKey);
    setWebhookUrl(localWebhook);
    close();
  };

  return (
    <div className="modal">
      <div className="modal-content glass-panel">
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '1.5rem' }}>// SYSTEM_CONFIG</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>GROQ_API_KEY</label>
            <input 
              type="password" 
              value={localGroqKey} 
              onChange={e => setLocalGroqKey(e.target.value)} 
              placeholder="gsk_..." 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>N8N_WEBHOOK_URL</label>
            <input 
              type="text" 
              value={localWebhook} 
              onChange={e => setLocalWebhook(e.target.value)} 
              placeholder="https://n8n.your-instance.com/..." 
            />
          </div>
          
          <button onClick={handleSave} className="btn-primary">SAVE CONFIG</button>
          <button onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>[ CANCEL ]</button>
        </div>
      </div>
    </div>
  );
}
