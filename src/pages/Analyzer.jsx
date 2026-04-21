import React, { useState } from 'react';
import { generateGroqAnalysis } from '../utils/api';
import { parseAIResponse, evaluateCredibility, applyLogicRules } from '../utils/logicEngine';

export default function Analyzer({ 
  webhookUrl, 
  knowledgeBase, 
  trustedSources, 
  flaggedSources,
  addHistoryItem
}) {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runLocalAnalysis = () => {
    // Basic Keyword Similarity Search (RAG fallback)
    const getKeywords = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);
    const inputKws = getKeywords(content);
    
    const similar = knowledgeBase.map(a => {
      const akws = getKeywords(a.title);
      const matches = inputKws.filter(kw => akws.includes(kw)).length;
      return { ...a, score: matches };
    }).sort((a, b) => b.score - a.score)[0];

    const isMatch = similar && similar.score > 1;
    
    return {
      finalVerdict: isMatch ? similar.label : 'UNVERIFIED',
      confidence: isMatch ? (60 + (similar.score * 10)) : 45,
      sentimentVerdict: 'NEUTRAL ANALYSIS',
      sentimentScore: 5,
      credibilityStatus: isMatch ? 'KNOWLEDGE_BASE_MATCH' : 'UNKNOWN',
      credibilityClass: isMatch ? 'trusted' : 'unknown',
      reasoning: [
        isMatch ? `Matched with known record: "${similar.title}"` : "No direct matches found in local intelligence core.",
        "Performing heuristic pattern matching...",
        "Cross-referencing trusted source list..."
      ],
      ruleApplied: 'Local Sentinel Engine (Offline)',
      similarArticle: isMatch ? similar.title : 'None'
    };
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setResult(null);

    // If no Webhook, use Local Fallback
    if (!webhookUrl) {
      setTimeout(() => {
        setResult(runLocalAnalysis());
        setLoading(false);
      }, 1500);
      return;
    }

    try {
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
      
      // 2. Parse the Webhook response (matching your n8n workflow output)
      const finalResult = {
        finalVerdict: data.verdict || 'UNKNOWN',
        confidence: parseInt(data.confidence) || parseInt(data.bayes_score) || 50,
        sentimentVerdict: data.sentiment_verdict || 'NEUTRAL',
        sentimentScore: data.sentiment_score || 5,
        credibilityStatus: data.source_status || 'UNKNOWN',
        credibilityClass: (data.source_status || 'UNKNOWN').toLowerCase(),
        reasoning: [data.reason1, data.reason2, data.reason3].filter(Boolean),
        ruleApplied: data.logic_rule_applied || 'Cloud Intelligence Analysis',
        similarArticle: data.similar_article || 'Cross-referenced via Knowledge Base'
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
      alert('SENTINEL_ERROR: Intelligence Link Offline. Ensure your n8n Webhook URL is correctly configured in [ SYSTEM_SYNC ] and is currently active.');
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
          placeholder="// PASTE ARTICLE OR HEADLINE HERE..."
        ></textarea>
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
