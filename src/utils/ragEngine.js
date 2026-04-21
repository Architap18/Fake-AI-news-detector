export async function fetchKnowledgeBase(googleSheetUrl) {
    if (!googleSheetUrl) return [];
    try {
        const response = await fetch(googleSheetUrl);
        const data = await response.json();
        // Filter valid rows that have content
        return data.filter(row => row.content || row.Context || row['ARTICLE CONTENT']); 
    } catch (error) {
        console.error("Failed to fetch Google Sheet Knowledge Base:", error);
        return [];
    }
}

export function findSimilarArticles(text, ragKnowledgeBase) {
    if (!ragKnowledgeBase || ragKnowledgeBase.length === 0) return [];
    
    const getKeywords = (str) => {
        if (!str) return [];
        return String(str).toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);
    };
    
    const inputKeywords = getKeywords(text);
    if (inputKeywords.length === 0) return [];
    
    const scoredArticles = ragKnowledgeBase.map(article => {
        const articleText = article.content || article.Context || article['ARTICLE CONTENT'] || "";
        const articleKeywords = getKeywords(articleText);
        
        let matches = 0;
        inputKeywords.forEach(kw => {
            if (articleKeywords.includes(kw)) matches++;
        });
        
        const score = matches / (inputKeywords.length + 0.001);
        return { 
            context: article.context || article.Context || articleText.substring(0, 150), 
            verdict: article.verdict || article.Verdict || article['ACTUAL'] || "Unknown", 
            similarityScore: score 
        };
    });
    
    return scoredArticles.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);
}
