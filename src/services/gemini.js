import { CONFIG } from './config';
import { getApiKey } from './storage';
import { getGlobalSettings } from './settings';

const fetchWithRetry = async (url, options, retries = 5, backoff = 2000) => {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 || response.status >= 500) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
};

export const generateLiturgy = async (prompt, isRetry = false) => {
    try {
        // STRATEGY: 1. ENV, 2. LocalStorage, 3. Firestore (Cloud)
        let userKey = import.meta.env.VITE_GOOGLE_API_KEY || getApiKey();

        if (!userKey || userKey === "") {
            // Try fetching from Cloud
            try {
                const globalSettings = await getGlobalSettings();
                if (globalSettings?.googleApiKey) {
                    userKey = globalSettings.googleApiKey;
                    // Optional: Cache it locally to save reads? 
                    // saveApiKey(userKey); // Maybe risky if we want it purely cloud managed. Let's keep it direct for now.
                }
            } catch (err) {
                console.warn("Could not fetch cloud settings:", err);
            }
        }

        if (!userKey) {
            throw new Error("Falta la API Key. Configúrala en el menú ⚙️ o en .env");
        }

        const response = await fetchWithRetry(`${CONFIG.ENDPOINTS.GENERATE}?key=${userKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });
        const data = await response.json();

        if (data.error) {
            // Handle specific Google API error codes
            console.error("Gemini Raw Error:", data.error);
            const msg = data.error.message || "Error desconocido de Google";
            if (msg.includes('API key') || data.error.code === 403) {
                throw new Error(`Tu API Key no es válida (Code ${data.error.code}). Verifica en ⚙️`);
            }
            throw new Error(`Google Error ${data.error.code}: ${msg}`);
        }

        const candidate = data.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            console.error("Gemini Incomplete Response:", JSON.stringify(data, null, 2));

            // SAFETY FILTER BYPASS: Auto-Retry on RECITATION
            if (candidate?.finishReason === 'RECITATION' && !isRetry) {
                console.warn("⚠️ RECITATION DETECTED. Retrying with AGGRESSIVE Rescue Mode...");
                const safePrompt = prompt + `
                
                ⚠️ EMERGENCIA CRÍTICA: BLOQUEO POR COPYRIGHT (INTENTO 2/2) ⚠️
                
                Google ha eliminado tu respuesta porque estás copiando texto protegido del Leccionario moderno.
                
                TU NUEVA MISIÓN: "PARAFRASEA O MUERE".
                
                1. ⛔ PROHIBIDO USAR EL TEXTO LITERAL DEL LECCIONARIO ACTUAL.
                2. ✅ USA ÚNICAMENTE LA BIBLIA "TORRES AMAT" (1825) O "VULGATA TRADUCIDA" (Dominio Público).
                3. SI NO TIENES ACCESO: TRADUCE TÚ MISMO DEL LATÍN O INGLÉS (RSV) AL ESPAÑOL.
                4. SI TODO FALLA: ESCRIBE UN RESUMEN HOMILÉTICO DETALLADO DE LA LECTURA EN LUGAR DEL TEXTO (Ej: "En esta lectura, San Pablo exhorta a los corintios a...").
                
                PREFIERO UNA TRADUCCIÓN ANTIGUA O UN RESUMEN A UN MENSAJE DE ERROR.
                ¡NO DEJES EL CAMPO VACÍO!
                `;
                return generateLiturgy(safePrompt, true);
            }

            throw new Error(`Respuesta incompleta de Google. Razón: ${candidate?.finishReason || 'Desconocida'}. Revisa la consola.`);
        }

        return candidate.content.parts[0].text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
};
