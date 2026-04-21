export function parseAIResponse(responseContent) {
  let parsed;
  try {
    // Handling potential string cleanup if Groq adds markdown
    const jsonStr = typeof responseContent === 'string' 
      ? responseContent.replace(/```json/g, '').replace(/```/g, '').trim()
      : responseContent;
    parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  } catch (e) {
    console.error("Parse error:", e);
    parsed = {};
  }
  
  return {
    verdict: (parsed.verdict || parsed.VERDICT || 'UNKNOWN').toUpperCase(),
    confidence: parseInt(parsed.confidence || parsed.CONFIDENCE) || 50,
    sentimentScore: parseInt(parsed.sentimentScore || parsed.SENTIMENT_SCORE) || 5,
    sentimentVerdict: parsed.sentimentVerdict || parsed.SENTIMENT_VERDICT || 'Neutral',
    reasoning: [
      parsed.reason1 || parsed.REASON1,
      parsed.reason2 || parsed.REASON2,
      parsed.reason3 || parsed.REASON3
    ].filter(Boolean),
    similarArticle: parsed.similar_article || parsed.SIMILAR_ARTICLE || 'None'
  };
}

export function evaluateCredibility(sourceName, trustedSources, flaggedSources) {
  if (!sourceName) return { status: 'UNKNOWN', class: 'unknown' };
  const s = sourceName.toUpperCase();
  
  if (trustedSources.some(t => s.includes(t.name.toUpperCase()))) return { status: 'TRUSTED', class: 'trusted' };
  if (flaggedSources.some(f => s.includes(f.name.toUpperCase())) || s.includes('FABRICATED')) return { status: 'FLAGGED', class: 'flagged' };
  
  return { status: 'UNKNOWN', class: 'unknown' };
}

export function applyLogicRules(aiResult, sourceName, credibility) {
  const source = (sourceName || '').toUpperCase();
  const status = credibility.status;
  const sentiment = aiResult.sentimentScore;
  const confidence = aiResult.confidence;
  const verdict = aiResult.verdict;
  
  let finalVerdict = verdict;
  let rule = 'AI Standard Analysis';

  // Rule 1: If source contains FABRICATED → override to FAKE
  if (source.includes('FABRICATED')) {
    finalVerdict = 'FAKE';
    rule = 'Rule 1: Fabricated source override';
  }
  // Rule 2: If source FLAGGED AND sentiment > 6 → FAKE
  else if (status === 'FLAGGED' && sentiment > 6) {
    finalVerdict = 'FAKE';
    rule = 'Rule 2: Flagged source + high sentiment';
  }
  // Rule 3: If source TRUSTED AND sentiment < 3 → REAL
  else if (status === 'TRUSTED' && sentiment < 3) {
    finalVerdict = 'REAL';
    rule = 'Rule 3: Trusted source + low sentiment';
  }
  // Rule 4: If confidence > 70 AND verdict FAKE → FAKE confirmed
  else if (confidence > 70 && verdict === 'FAKE') {
    finalVerdict = 'FAKE';
    rule = 'Rule 4: High confidence FAKE verification';
  }
  // Rule 5: If source TRUSTED AND confidence < 35 → REAL
  else if (status === 'TRUSTED' && confidence < 35) {
    finalVerdict = 'REAL';
    rule = 'Rule 5: Trusted source low confidence override';
  }

  return { finalVerdict, rule };
}
