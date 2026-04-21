import React, { useState } from 'react';

export default function SettingsModal({ close, webhookUrl, setWebhookUrl }) {
  const [localWebhook, setLocalWebhook] = useState(webhookUrl);

  const handleSave = () => {
    localStorage.setItem('webhookUrl', localWebhook);
    setWebhookUrl(localWebhook);
    close();
  };

  return (
    <div className="modal">
      <div className="modal-content glass-panel">
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: '1.5rem' }}>// SYSTEM_SYNC</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>N8N_INTELLIGENCE_WEBHOOK</label>
            <input 
              type="text" 
              value={localWebhook} 
              onChange={e => setLocalWebhook(e.target.value)} 
              placeholder="https://n8n.your-instance.com/fakeshield-submit" 
            />
          </div>
          
          <button onClick={handleSave} className="btn-primary">SYNC INFRASTRUCTURE</button>
          <button onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>[ CANCEL ]</button>
        </div>
      </div>
    </div>
  );
}
