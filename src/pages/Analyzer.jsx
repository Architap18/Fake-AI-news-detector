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

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Direct API call to Groq for independence
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are FakeShield AI, a high-accuracy news validator. 
              CRITICAL: Do NOT give a FAKE verdict unless you are 100% certain it is misinformation.
              - If the news is reported by mainstream media (BBC, Reuters, CNN, etc.), it is REAL.
              - If you are unsure or the data is conflicting, your verdict MUST be "UNVERIFIED" or "INCONCLUSIVE".
              - Never call a major world event "FAKE" just because it sounds strange.
              Respond ONLY in JSON: 
              { 
                "verdict": "REAL/FAKE/UNVERIFIED", 
                "confidence": 0-100, 
                "reasoning": ["Evidence 1", "Evidence 2"], 
                "source_name": "Official Source Name", 
                "ai_score": 0-100,
                "emotional_bias": "LOW/HIGH",
                "evidence_matrix": [
                  {"claim": "Main Headline", "status": "VERIFIED/SUSPICIOUS/UNVERIFIED"}
                ]
              }`
            },
            {
              role: "user",
              content: `Is this real or fake? Analyze this: ${content}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      const finalResult = {
        ...analysis,
        timestamp: new Date().toLocaleTimeString(),
        ruleApplied: 'Forensic Intelligence Analysis'
      };

      setResult(finalResult);

      addHistoryItem({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        context: content.substring(0, 60) + '...',
        source: analysis.source_name || 'Expert Scan',
        verdict: analysis.verdict,
        confidence: analysis.confidence
      });

    } catch (e) {
      console.error(e);
      alert('SCAN_ERROR: Intelligence Link Interrupted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-grid">
      <div className="input-card glass-panel">
        {loading && <div className="scanner-overlay"></div>}
        <h3 className="scanning-text" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          {loading ? '> ANALYZING_CREDIBILITY...' : '> NEWS_ARTICLE_SCANNER'}
        </h3>
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="// PASTE NEWS ARTICLE OR HEADLINE HERE..."
          style={{ width: '100%', minHeight: '250px' }}
        ></textarea>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleAnalyze} 
            className={`btn-primary ${loading ? 'scanning' : ''}`}
            disabled={loading}
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
          >
            {loading ? 'SCANNIG DATA...' : 'EXECUTE SCAN'}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>
              POWERED BY FAKESHIELD INTELLIGENCE CORE
            </span>
          </div>
        </div>
      </div>

      {result && (
        <div className="results-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="gauge-container">
              <svg className="gauge-svg" width="120" height="120">
                <circle className="gauge-bg" cx="60" cy="60" r="54" />
                <circle 
                  className="gauge-fill" 
                  cx="60" cy="60" r="54" 
                  style={{ strokeDasharray: `${(result.confidence / 100) * 339} 339` }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{result.confidence}%</span>
              </div>
            </div>
            <h2 className={`verdict-text ${result.verdict.toLowerCase()}`} style={{ marginTop: '1rem' }}>
              {result.verdict}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>VERDICT_CONFIDENCE_RATING</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>AI_PATTERN_DETECTION</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Linguistic Signature:</span>
                <span style={{ color: result.ai_score > 50 ? 'var(--danger)' : 'var(--safe)' }}>
                  {result.ai_score > 50 ? 'AI_GENERATED' : 'HUMAN_ORIGIN'}
                </span>
              </div>
              <div className="meter-bar">
                <div className="meter-fill" style={{ width: `${result.ai_score}%`, background: 'var(--secondary)' }}></div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>EMOTIONAL_BIAS_SENSOR</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: result.emotional_bias === 'HIGH' ? 'var(--danger)' : 'var(--safe)' }}>
                {result.emotional_bias}_MANIPULATION
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Status: {result.emotional_bias === 'HIGH' ? 'SENTIMENT_ALERT' : 'NOMINAL'}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>EVIDENCE_MATRIX_VERIFICATION</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.evidence_matrix.map((item, i) => (
                <div key={i} className={`evidence-pill ${item.status === 'VERIFIED' ? 'verified' : 'alert'}`}>
                  <i className={item.status === 'VERIFIED' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
                  {item.claim}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>FORENSIC_REASONING_LOG</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {result.reasoning.map((r, i) => (
                <li key={i} style={{ marginBottom: '0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>[{i+1}]</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
