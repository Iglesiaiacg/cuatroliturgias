import { CONFIG } from './config';

export const generateLiturgy = async (prompt) => {
    try {
        const response = await fetch(`${CONFIG.ENDPOINTS.GENERATE}?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const candidate = data.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            throw new Error("Respuesta inválida o incompleta de la IA.");
        }

        return candidate.content.parts[0].text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
};
