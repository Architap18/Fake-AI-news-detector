import React, { useState } from 'react';
import { generateGroqAnalysis } from '../utils/api';
import { parseAIResponse, evaluateCredibility, applyLogicRules } from '../utils/logicEngine';

export default function Analyzer({ 
  groqApiKey, 
  knowledgeBase, 
  trustedSources, 
  flaggedSources,
  addHistoryItem
}) {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      // 1. RAG Search (Local)
      const getKeywords = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);
      const inputKws = getKeywords(content);
      const similar = knowledgeBase.map(a => {
        const akws = getKeywords(a.title);
        const matches = inputKws.filter(kw => akws.includes(kw)).length;
        return { ...a, score: matches };
      }).sort((a, b) => b.score - a.score).slice(0, 3);

      const ragContext = similar.map(a => `- "${a.title}" (Label: ${a.label}, Source: ${a.source})`).join('\n');

      // 2. Direct Groq AI Call
      const prompt = `Analyze this news article for authenticity.
KNOWLEDGE BASE CONTEXT:
${ragContext}

Respond ONLY in valid JSON format:
{
  "VERDICT": "REAL" or "FAKE",
  "CONFIDENCE": 0-100,
  "SENTIMENT_SCORE": 0-10,
  "SENTIMENT_VERDICT": "NEUTRAL" or "EMOTIONAL" or "MANIPULATIVE",
  "REASON1": "...",
  "REASON2": "...",
  "REASON3": "...",
  "SIMILAR_ARTICLE": "title of most similar article"
}

Article: ${content}
Source: ${source}`;

      const responseRaw = await generateGroqAnalysis(groqApiKey, prompt);
      const parsed = parseAIResponse(responseRaw);
      const credibility = evaluateCredibility(source, trustedSources, flaggedSources);
      const { finalVerdict, rule } = applyLogicRules(parsed, source, credibility);

      const finalResult = {
        ...parsed,
        finalVerdict,
        ruleApplied: rule,
        credibilityStatus: credibility.status,
        credibilityClass: credibility.class
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
      alert('SYSTEM ERROR: Analysis failed. Ensure your network is active.');
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
