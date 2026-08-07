/**
 * Vercel Serverless Function: /api/chat
 * Rotates through 5 Gemini API keys on rate-limits/errors and utilizes Google Search Grounding.
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Missing query in request body' });
    }

    // Collect defined Gemini API keys from environment
    const keys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5
    ].filter(Boolean);

    if (keys.length === 0) {
        console.warn('No Gemini API keys configured in environment variables.');
        return res.status(200).json({ fallback: true });
    }

    const systemInstruction = `You are Mike, a friendly, professional, male AI portfolio assistant for Shaikh Abdulrauf Asifparvez (Full-Stack Developer, VGEC Ahmedabad). Keep answers concise, clear, and engaging. Speak as a personal representative of Abdulrauf. IMPORTANT: If the user's query is about general topics, facts, or questions unrelated to Abdulrauf, his projects, or his background, answer the question directly, accurately, and naturally. DO NOT force or append portfolio information, links, or mention Abdulrauf unless the topic is relevant to his work. CRITICAL: Do NOT use any Markdown formatting characters (like asterisks **, double asterisks, hashtags #, or backticks) in your response. Output only plain readable text.`;

    // Try sending query to Gemini rotating through keys on 429/errors
    for (let i = 0; i < keys.length; i++) {
        const apiKey = keys[i];
        try {
            // Using standard Gemini API v1beta generateContent endpoint
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: query }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    tools: [{ googleSearch: {} }] // Enable Google Search Grounding
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return res.status(200).json({ success: true, text });
                }
            }

            console.warn(`Gemini Key ${i + 1} failed with status: ${response.status}. Rotating...`);
        } catch (err) {
            console.error(`Gemini Key ${i + 1} request error:`, err);
        }
    }

    // If all keys fail, tell client to use local fallback
    console.error('All 5 Gemini API keys failed or exhausted quota. Triggering client fallback.');
    return res.status(200).json({ fallback: true });
}
