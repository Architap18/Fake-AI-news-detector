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
              content: `You are FakeShield AI Forensic Analyst. 
              TASKS: 
              1. Cross-reference with credible global news agencies (Reuters, AP, BBC, etc.).
              2. Identify specific sources reporting this.
              3. Provide detailed step-by-step reasoning.
              Respond ONLY in JSON: 
              { 
                "verdict": "string", 
                "confidence": 0-100, 
                "verified_sources": ["Reuters", "BBC", "Official Handle"],
                "suspicious_sources": ["Unknown Blog", "Propaganda Site"],
                "detailed_reasoning": ["Step 1:...", "Step 2:..."],
                "green_flags": ["..."],
                "red_flags": ["..."],
                "ai_score": 0-100,
                "emotional_bias": "string",
                "evidence_matrix": [{"claim": "...", "status": "..."}]
              }`
            },
            {
              role: "user",
              content: `Full Forensic & Source Scan: ${content}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      setResult({
        ...analysis,
        ruleApplied: 'Multi-Source Cross-Verification'
      });

      addHistoryItem({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        context: content.substring(0, 60) + '...',
        source: analysis.verified_sources?.[0] || 'Expert Scan',
        verdict: analysis.verdict,
        confidence: analysis.confidence
      });

    } catch (e) {
      console.error(e);
      alert('SCAN_ERROR: Link Interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictClass = (v) => {
    if (v.includes('REAL')) return 'real';
    if (v.includes('FAKE')) return 'fake';
    return 'suspicious';
  };

  return (
    <div className="analyzer-grid">
      <div className="input-card glass-panel">
        {loading && <div className="scanner-overlay"></div>}
        <h3 className="scanning-text" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          {loading ? '> CROSS_REFERENCING_SOURCES...' : '> SOURCE_VERIFICATION_RADAR_v4'}
        </h3>
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="// PASTE NEWS FOR SOURCE CROSS-CHECK..."
          style={{ width: '100%', minHeight: '200px' }}
        ></textarea>
        
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={handleAnalyze} 
            className={`btn-primary ${loading ? 'scanning' : ''}`}
            disabled={loading}
            style={{ width: '100%', padding: '1.2rem' }}
          >
            {loading ? 'SCRAPING GLOBAL INTEL...' : 'EXECUTE SOURCE SCAN'}
          </button>
        </div>
      </div>

      {result && (
        <div className="results-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: `4px solid var(--${getVerdictClass(result.verdict)})` }}>
            <h2 className={`verdict-text ${getVerdictClass(result.verdict)}`} style={{ fontSize: '2.5rem' }}>
              {result.verdict}
            </h2>
            <div className="meter-bar" style={{ margin: '1rem auto', maxWidth: '300px' }}>
              <div className="meter-fill" style={{ width: `${result.confidence}%` }}></div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>CONFIDENCE_LEVEL: {result.confidence}%</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.8rem', marginBottom: '1rem' }}>SOURCE_RADAR_DETECTION</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--safe)', marginBottom: '0.5rem' }}>TRUSTED_ORGANIZATIONS:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {result.verified_sources?.map((s, i) => <span key={i} className="pill verified" style={{ fontSize: '0.6rem' }}>{s}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>SUSPICIOUS_ENTITIES:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {result.suspicious_sources?.map((s, i) => <span key={i} className="pill alert" style={{ fontSize: '0.6rem' }}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.8rem', marginBottom: '1rem' }}>DETAILED_FORENSIC_REASONING</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              {result.detailed_reasoning?.map((r, i) => (
                <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>[{i+1}]</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>AI_SCORE</h4>
              <div className="meter-bar" style={{ height: '6px' }}>
                <div className="meter-fill" style={{ width: `${result.ai_score}%`, background: 'var(--secondary)' }}></div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>BIAS_LEVEL</h4>
              <p style={{ fontWeight: 'bold' }}>{result.emotional_bias}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>EVIDENCE_MATRIX</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.evidence_matrix.map((e, i) => (
                <span key={i} className="pill" style={{ fontSize: '0.65rem' }}>{e.claim}: {e.status}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
