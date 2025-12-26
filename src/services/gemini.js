import { CONFIG } from './config';
import { getApiKey } from './storage';

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
        const userKey = import.meta.env.VITE_GOOGLE_API_KEY || getApiKey();
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
                console.warn("⚠️ RECITATION DETECTED. Retrying with Safe Mode Prompt...");
                const safePrompt = prompt + `
                
                ⚠️ ADVERTENCIA DE SEGURIDAD (COPYRIGHT DETECTADO):
                El sistema ha bloqueado la generación anterior por coincidencia con textos protegidos.
                
                PARA ESTE INTENTO (PRIORIDAD MÁXIMA = TEXTOS COMPLETOS):
                1. LECTURAS BÍBLICAS: DEBEN ESTAR COMPLETAS (Palabra por palabra). Usa versiones CATÓLICAS de DOMINIO PÚBLICO (Torres Amat, Vulgata traducida) si es necesario para evitar bloqueo. NUNCA USES REINA VALERA.
                2. ORACIONES FIJAS (Canon, Prefacios): ESCRÍBELAS COMPLETAS. Si detectas riesgo de copyright en traducciones modernas, usa una traducción tradicional o ligeramente parafraseada pero COMPLETA.
                3. NO RESUMAS NADA. El usuario necesita el texto para leerlo en el altar.
                4. SI ES IMPOSIBLE poner una oración moderna por copyright, pon la versión en LATÍN o INGLÉS (si la traducción española es el problema) o una traducción libre fiel.
                
                SOLO COMO ÚLTIMO RECURSO si algo es extremadamente largo y fijo (ej. un himno moderno protegido): Usa Incipit. PERO LAS LECTURAS Y EL CANON DEBEN IR COMPLETOS.
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
