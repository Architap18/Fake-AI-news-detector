import React from 'react';

export default function EthicsModal({ close }) {
  return (
    <div className="modal" onClick={(e) => { if (e.target.className === 'modal') close(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>AI Limitations & Ethics Disclaimer</h2>
          <i className="ri-close-line" onClick={close} style={{ cursor: 'pointer' }}></i>
        </div>
        <div className="modal-body">
          <p><strong>Disclaimer:</strong> This AI-Powered Fake News Detector is a class project.</p>
          <ul>
            <li>AI models can hallucinate or be confidently incorrect.</li>
            <li>Always cross-reference factual claims with human-verified fact-checking organizations (e.g., Reuters, Snopes).</li>
            <li>Sentiment analysis is subjective and can misinterpret nuance or sarcasm.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
