import { CONFIG } from './config';
import { getApiKey } from './storage';

export const generateLiturgy = async (prompt) => {
    try {
        const userKey = getApiKey();
        if (!userKey) {
            throw new Error("Falta la API Key. Configúrala en el menú ⚙️");
        }

        const response = await fetch(`${CONFIG.ENDPOINTS.GENERATE}?key=${userKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();

        if (data.error) {
            // Handle specific Google API error codes
            const msg = data.error.message || "Error desconocido de Google";
            if (msg.includes('API key') || data.error.code === 403) {
                throw new Error("Tu API Key no es válida o expiró. Verifica en ⚙️");
            }
            throw new Error(msg);
        }

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
