import React, { useState, useEffect } from 'react';
import { generateGroqAnalysis } from '../utils/api';
import { parseAIResponse, evaluateCredibility, applyLogicRules } from '../utils/logicEngine';

export default function Analyzer({ 
  webhookUrl, 
  knowledgeBase, 
  trustedSources, 
  flaggedSources,
  addHistoryItem,
  prefillContent,
  setPrefillContent
}) {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (prefillContent && prefillContent.content) {
      setContent(prefillContent.content);
      setSource(prefillContent.source || '');
      // Clear prefill after loading it
      setPrefillContent({ content: '', source: '' });
    }
  }, [prefillContent, setPrefillContent]);

  const [isUrl, setIsUrl] = useState(false);

  useEffect(() => {
    if (content.startsWith('http')) {
      setIsUrl(true);
    } else {
      setIsUrl(false);
    }
  }, [content]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      // 1. Send to n8n Webhook (Supports both text and URLs now)
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: content.substring(0, 100),
          article_text: content,
          source: source || 'Unknown',
          date: new Date().toLocaleDateString()
        })
      });

      if (!response.ok) throw new Error('Intelligence Link Offline');
      
      const data = await response.json();
      
      // 2. Map n8n response to UI
      const finalResult = {
        finalVerdict: data.verdict || 'UNKNOWN',
        confidence: parseInt(data.confidence) || 50,
        sentimentVerdict: data.sentiment_verdict || 'NEUTRAL',
        sentimentScore: data.sentiment_score || 5,
        credibilityStatus: data.source_status || 'UNKNOWN',
        credibilityClass: (data.source_status || 'UNKNOWN').toLowerCase(),
        reasoning: [data.reason1, data.reason2, data.reason3].filter(Boolean),
        ruleApplied: data.rule_applied || 'Cloud Intelligence Analysis',
        similarArticle: data.similar_article || 'None'
      };

      setResult(finalResult);

      addHistoryItem({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        context: content.substring(0, 60) + '...',
        source: source || 'Unknown',
        verdict: finalResult.finalVerdict,
        confidence: finalResult.confidence
      });

    } catch (e) {
      console.error(e);
      alert('SENTINEL_ERROR: Connection to Intelligence Core timed out. Ensure n8n is running and "Execute Workflow" is clicked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-grid">
      <div className="input-card glass-panel">
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="// PASTE ARTICLE, HEADLINE, OR URL HERE..."
        ></textarea>
        {isUrl && (
          <div className="url-indicator" style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <i className="ri-radar-line"></i> URL DETECTED: SENTINEL SCRAPER ENGAGING...
          </div>
        )}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={source} 
            onChange={e => setSource(e.target.value)} 
            placeholder="// SOURCE [OPTIONAL]" 
          />
          <button 
            onClick={handleAnalyze} 
            className={`btn-primary ${loading ? 'scanning' : ''}`}
            disabled={loading}
          >
            {loading ? 'SCANNIG...' : 'ANALYZE'}
          </button>
        </div>
      </div>

      {result && (
        <div className="results-container">
          <div className="terminal-card" style={{ animationDelay: '0.1s' }}>
            <h3><i className="ri-shield-line"></i> Verdict Analysis</h3>
            <div className={`verdict-text ${result.finalVerdict.toLowerCase()}`}>
              {result.finalVerdict}
            </div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${result.confidence}%` }}></div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
              CONFIDENCE: {result.confidence}%
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="terminal-card" style={{ animationDelay: '0.2s' }}>
              <h3><i className="ri-emotion-line"></i> Sentiment Card</h3>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--secondary)' }}>
                {result.sentimentVerdict}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>SCORE: {result.sentimentScore}/10</p>
            </div>
            <div className="terminal-card" style={{ animationDelay: '0.3s' }}>
              <h3><i className="ri-bookmark-line"></i> Source Card</h3>
              <span className={`pill ${result.credibilityClass}`}>{result.credibilityStatus}</span>
            </div>
          </div>

          <div className="terminal-card" style={{ animationDelay: '0.4s' }}>
            <h3><i className="ri-terminal-box-line"></i> Reasoning Card</h3>
            <ul style={{ listStyle: 'none', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
              {result.reasoning.map((r, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)' }}>// REASON {i + 1}:</span> {r}
                </li>
              ))}
              <li style={{ marginTop: '1rem', color: 'var(--secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--primary)' }}>// LOGIC:</span> {result.ruleApplied}
              </li>
            </ul>
          </div>

          <div className="terminal-card" style={{ animationDelay: '0.5s' }}>
            <h3><i className="ri-file-list-line"></i> Similar Articles Card</h3>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              "{result.similarArticle}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
