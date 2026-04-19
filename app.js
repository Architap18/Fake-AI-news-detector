// ==== STATE MANAGEMENT ====
const state = {
    history: [],
    trustedSources: [
        { id: 1, name: 'Reuters' },
        { id: 2, name: 'Associated Press' },
        { id: 3, name: 'BBC News' },
        { id: 4, name: 'The New York Times' },
        { id: 5, name: 'NPR' }
        { id:6 , name: 'CNN News'}
    ],
    flaggedSources: [
        { id: 6, name: 'The Onion' },
        { id: 7, name: 'NaturalNews' },
        { id: 8, name: 'Infowars' },
        { id: 9, name: 'Patriot Truth Blog' }
    ],
    currentAnalysis: null
};

// Dummy Data to prepopulate Dashboard
const dummyHistory = [
    {
        id: 101,
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        context: 'Elections delayed until next year according to anonymous source',
        source: 'Patriot Truth Blog',
        verdict: 'Fake',
        confidence: 94
    },
    {
        id: 102,
        date: new Date(Date.now() - 172800000).toLocaleDateString(),
        context: 'NASA announces successful deployment of new space telescope',
        source: 'Reuters',
        verdict: 'Real',
        confidence: 98
    }
];
state.history = [...dummyHistory];

// ==== DOM ELEMENTS ====
// Views
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

// Analyzer Elements
const articleInput = document.getElementById('articleInput');
const urlInput = document.getElementById('urlInput');
const sourceInput = document.getElementById('sourceInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingState = document.getElementById('loadingState');
const loadingText = document.getElementById('loadingText');
const resultsReport = document.getElementById('resultsReport');
const resetAnalyzeBtn = document.getElementById('resetAnalyzeBtn');
const saveResultBtn = document.getElementById('saveResultBtn');

// Report Elements
const verdictBadge = document.getElementById('verdictBadge');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceValue = document.getElementById('confidenceValue');
const sentimentCircle = document.getElementById('sentimentCircle');
const sentimentValue = document.getElementById('sentimentValue');
const sentimentDesc = document.getElementById('sentimentDesc');
const credibilityScore = document.getElementById('credibilityScore');
const credibilityStatus = document.getElementById('credibilityStatus');
const credibilityDesc = document.getElementById('credibilityDesc');
const logicReasoning = document.getElementById('logicReasoning');

// Dashboard Elements
const historyBody = document.getElementById('historyBody');
const statTotal = document.getElementById('statTotal');
const statFake = document.getElementById('statFake');
const statReal = document.getElementById('statReal');

// Knowledge Map Elements
const trustedSourcesList = document.getElementById('trustedSourcesList');
const flaggedSourcesList = document.getElementById('flaggedSourcesList');
const addSourceBtn = document.getElementById('addSourceBtn');
const newSourceName = document.getElementById('newSourceName');
const newSourceType = document.getElementById('newSourceType');

// Ethics Modal
const ethicsBtn = document.getElementById('ethicsBtn');
const ethicsModal = document.getElementById('ethicsModal');
const closeModal = document.getElementById('closeModal');

// Tabs
const tabs = document.querySelectorAll('.tab');

// ==== INITIALIZATION ====
function init() {
    setupNavigation();
    setupTabs();
    setupModals();
    renderKnowledgeMap();
    renderDashboard();
    
    // Event Listeners
    analyzeBtn.addEventListener('click', handleAnalyze);
    resetAnalyzeBtn.addEventListener('click', resetAnalyzer);
    saveResultBtn.addEventListener('click', saveResult);
    addSourceBtn.addEventListener('click', addSource);
}

// ==== UI LOGIC ====
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update nav actively
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch view
            const viewId = `view-${item.dataset.view}`;
            views.forEach(view => {
                if (view.id === viewId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}

function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const type = tab.dataset.type;
            if (type === 'text') {
                articleInput.style.display = 'block';
                urlInput.style.display = 'none';
            } else {
                articleInput.style.display = 'none';
                urlInput.style.display = 'block';
            }
        });
    });
}

function setupModals() {
    ethicsBtn.addEventListener('click', () => {
        ethicsModal.classList.remove('hidden');
    });
    
    closeModal.addEventListener('click', () => {
        ethicsModal.classList.add('hidden');
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === ethicsModal) {
            ethicsModal.classList.add('hidden');
        }
    });
}

function resetAnalyzer() {
    document.querySelector('.input-card').classList.remove('hidden');
    resultsReport.classList.add('hidden');
    articleInput.value = '';
    urlInput.value = '';
    sourceInput.value = '';
    state.currentAnalysis = null;
}

// ==== CORE LOGIC (AI SIMULATION & CREDIBILITY) ====

// Step 3 logic: if source flagged -> extreme likely fake
function evaluateCredibility(sourceName) {
    if (!sourceName) return { score: '?', status: 'unknown', desc: 'No source provided. AI relies purely on text analysis.' };
    
    const sourceLower = sourceName.toLowerCase().trim();
    
    const isTrusted = state.trustedSources.some(s => s.name.toLowerCase() === sourceLower);
    if (isTrusted) {
        return { score: 'A', status: 'trusted', class: 'trusted', desc: 'Source matched in Knowledge Map as highly credible.' };
    }
    
    const isFlagged = state.flaggedSources.some(s => s.name.toLowerCase() === sourceLower);
    if (isFlagged) {
        return { score: 'F', status: 'flagged', class: 'flagged', desc: 'Source matched in Knowledge Map as known to spread misinformation.' };
    }
    
    return { score: 'C', status: 'unknown', class: 'unknown', desc: 'Source not found in Knowledge Map. Treat with moderate caution.' };
}

async function handleAnalyze() {
    const isText = document.querySelector('.tab.active').dataset.type === 'text';
    const content = isText ? articleInput.value : urlInput.value;
    const source = sourceInput.value;

    if (!content.trim()) {
        alert('Please provide content to analyze');
        return;
    }

    // Hide input, show loading
    document.querySelector('.input-card').classList.add('hidden');
    loadingState.classList.remove('hidden');

    // Simulate ChatGPT/AI analysis pipeline
    await simulateLoadingSteps();

    // Generate simulated AI Response based on content and source
    const analysis = generateSimulatedAnalysis(content, source);
    state.currentAnalysis = analysis;
    
    // Render Results
    loadingState.classList.add('hidden');
    renderResultsReport(analysis);
    resultsReport.classList.remove('hidden');
}

async function simulateLoadingSteps() {
    const steps = [
        "Extracting factual claims...",
        "Cross-referencing with Knowledge Map...",
        "Analyzing sentiment and emotional language...",
        "Evaluating logical consistency..."
    ];

    for (let currentStep of steps) {
        loadingText.textContent = currentStep;
        await new Promise(r => setTimeout(r, 800));
    }
}

function generateSimulatedAnalysis(content, source) {
    const textLower = content.toLowerCase();
    
    // 1. Evaluate Source (Milestone 3 logic)
    const credibility = evaluateCredibility(source);
    
    // 2. Simple logic for Dummy Responses
    // If text contains sensational words or source is flagged, lean towards fake
    const sensationalWords = ['shocking', 'secret', 'destroy', 'hidden', 'miracle', 'exposed', 'anonymous source', 'you won\'t believe', 'truth'];
    let sensativityScore = sensationalWords.filter(word => textLower.includes(word)).length;
    
    let verdict = 'Real';
    let confidence = 75 + Math.floor(Math.random() * 20); // 75-95
    let sentiment = 'Neutral';
    let sentimentClass = 'neutral';
    let sentimentDescText = 'Language is balanced and objective.';
    
    if (credibility.status === 'flagged' || sensativityScore >= 2) {
        verdict = 'Fake';
        confidence = 80 + Math.floor(Math.random() * 15);
        sentiment = 'Extreme';
        sentimentClass = 'negative';
        sentimentDescText = 'Highly charged emotional language designed to manipulate or incite anger/fear.';
    } else if (sensativityScore === 1 || credibility.status === 'unknown') {
        // Edge case
        confidence = 50 + Math.floor(Math.random() * 30);
        if (confidence < 70) verdict = 'Fake';
        sentiment = 'Sensational';
        sentimentClass = 'negative';
        sentimentDescText = 'Mildly sensational language detected. Shows slight bias.';
    } else {
        sentiment = 'Objective';
        sentimentClass = 'positive';
    }

    // Logic reasoning generator
    const bullets = [];
    bullets.push(`<strong>Source Assessment:</strong> ${credibility.desc}`);
    
    if (verdict === 'Fake') {
        bullets.push(`<strong>Emotional Manipulation:</strong> Detected ${sensativityScore} sensational/loaded phrases often used in clickbait.`);
        bullets.push(`<strong>Logical Consistency:</strong> Claims lack empirical backing and rely heavily on emotive persuasion rather than factual reporting.`);
    } else {
        bullets.push(`<strong>Factual Claims:</strong> The core claims align with standard reporting formats.`);
        bullets.push(`<strong>Tone:</strong> The article maintains an informative and measured tone.`);
    }

    return {
        context: textLower.substring(0, 50) + '...',
        content,
        source: source || 'Unknown',
        verdict,
        confidence,
        sentiment,
        sentimentClass,
        sentimentDescText,
        credibility,
        reasoning: `<ul><li>${bullets.join('</li><li>')}</li></ul>`
    };
}

function renderResultsReport(data) {
    // Verdict
    verdictBadge.textContent = data.verdict === 'Real' ? 'Real News Verified' : 'Likely Fake News';
    verdictBadge.className = `verdict-badge ${data.verdict.toLowerCase()}`;
    
    // Confidence
    setTimeout(() => {
        confidenceFill.style.width = `${data.confidence}%`;
    }, 100);
    confidenceValue.textContent = `${data.confidence}%`;
    
    // Sentiment
    sentimentValue.textContent = data.sentiment;
    sentimentCircle.className = `stat-circle ${data.sentimentClass}`;
    sentimentDesc.textContent = data.sentimentDescText;
    
    // Credibility
    credibilityScore.textContent = data.credibility.score;
    // Set color based on score (A = green, F = red, C = yellow/gray)
    credibilityScore.style.color = data.credibility.score === 'A' ? 'var(--success)' : data.credibility.score === 'F' ? 'var(--danger)' : 'var(--text-primary)';
    
    credibilityStatus.textContent = data.credibility.status.toUpperCase();
    credibilityStatus.className = `status ${data.credibility.class}`;
    credibilityDesc.textContent = data.credibility.desc;
    
    // Logic
    logicReasoning.innerHTML = data.reasoning;
}

// ==== DASHBOARD LOGIC ====
function saveResult() {
    if (!state.currentAnalysis) return;
    
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        context: state.currentAnalysis.context,
        source: state.currentAnalysis.source,
        verdict: state.currentAnalysis.verdict,
        confidence: state.currentAnalysis.confidence
    };
    
    state.history.unshift(newEntry);
    renderDashboard();
    
    // Switch to dashboard view automatically
    navItems[1].click(); 
    resetAnalyzer();
}

function renderDashboard() {
    historyBody.innerHTML = '';
    
    let fakeCount = 0;
    let realCount = 0;
    
    state.history.forEach(item => {
        if (item.verdict === 'Fake') fakeCount++;
        if (item.verdict === 'Real') realCount++;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.date}</td>
            <td>${item.context}</td>
            <td>${item.source}</td>
            <td><span class="badge ${item.verdict.toLowerCase()}">${item.verdict}</span></td>
            <td>${item.confidence}%</td>
            <td><button class="delete-btn" onclick="deleteHistoryItem(${item.id})"><i class="ri-delete-bin-line"></i></button></td>
        `;
        historyBody.appendChild(tr);
    });
    
    statTotal.textContent = state.history.length;
    statFake.textContent = fakeCount;
    statReal.textContent = realCount;
}

window.deleteHistoryItem = function(id) {
    state.history = state.history.filter(item => item.id !== id);
    renderDashboard();
};

// ==== KNOWLEDGE MAP LOGIC ====
function renderKnowledgeMap() {
    trustedSourcesList.innerHTML = '';
    flaggedSourcesList.innerHTML = '';
    
    state.trustedSources.forEach(source => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${source.name}</span> <button class="delete-btn" onclick="removeSource(${source.id}, 'trusted')"><i class="ri-close-line"></i></button>`;
        trustedSourcesList.appendChild(li);
    });
    
    state.flaggedSources.forEach(source => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${source.name}</span> <button class="delete-btn" onclick="removeSource(${source.id}, 'flagged')"><i class="ri-close-line"></i></button>`;
        flaggedSourcesList.appendChild(li);
    });
}

function addSource() {
    const name = newSourceName.value.trim();
    const type = newSourceType.value;
    
    if (!name) return;
    
    const newEntry = { id: Date.now(), name };
    
    if (type === 'trusted') {
        state.trustedSources.push(newEntry);
    } else {
        state.flaggedSources.push(newEntry);
    }
    
    newSourceName.value = '';
    renderKnowledgeMap();
}

window.removeSource = function(id, type) {
    if (type === 'trusted') {
        state.trustedSources = state.trustedSources.filter(s => s.id !== id);
    } else {
        state.flaggedSources = state.flaggedSources.filter(s => s.id !== id);
    }
    renderKnowledgeMap();
};

// Boot App
document.addEventListener('DOMContentLoaded', init);
