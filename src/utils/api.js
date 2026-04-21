export async function generateGroqAnalysis(groqApiKey, prompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "You are a JSON-only API. You must return only a valid JSON object. Do not include markdown formatting like ```json." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export function logToGoogleSheets(googleSheetUrl, entry) {
    if (!googleSheetUrl) return;
    try {
        fetch(googleSheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        console.log("Logged analysis to Google Sheets via Background POST");
    } catch(e) {
        console.error("Failed to sync with sheets", e);
    }
}
