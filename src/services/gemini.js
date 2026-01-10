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
                ],
                // On RETRY, we use VERY HIGH temperature to force deviation from copyrighted text
                generationConfig: {
                    temperature: isRetry ? 1.3 : 0.4,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
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
                console.warn("⚠️ RECITATION DETECTED. Retrying with ULTIMATE Rescue Mode (Temp 1.3)...");

                // ULTIMATE FIX: Regex Nuke on all "Copy" commands.
                let safePrompt = prompt
                    .replace(/TEXTO BÍBLICO COMPLETO/gi, "SOLO RESUMEN")
                    .replace(/TEXTO COMPLETO/gi, "SOLO RESUMEN")
                    .replace(/TEXTO EXACTO/gi, "SOLO RESUMEN")
                    .replace(/Copia el texto/gi, "Resume el texto")
                    .replace(/Escribe el texto/gi, "Resume el texto")
                    .replace(/Usa Biblia Torres Amat/gi, "Usa tus propias palabras");

                safePrompt += `
                
                🛑 CIERRE DE EMERGENCIA: BLOQUEO POR COPYRIGHT ACTIVO 🛑
                
                CAMBIO DE ESTRATEGIA INMEDIATO:
                1. EL USUARIO YA NO QUIERE LOS TEXTOS BÍBLICOS.
                2. SÓLO QUIERE LA ESTRUCTURA DE LA MISA.
                3. EN LUGAR DE LAS LECTURAS, escribe UNICAMENTE:
                   "[AQUÍ IRÍA LA LECTURA DE (Cita)]"
                   > (Escribe aquí un pensamiento espiritual breve de 1 línea sobre el tema).
                
                4. PROHIBIDO CITAR LA BIBLIA DIRECTAMENTE. 
                5. USA TUS PROPIAS PALABRAS PARA TODO.
                6. SÉ CREATIVO/ESPIRITUAL, PERO NO LITERAL.
                `;

                // Recursive call with HIGH TEMPERATURE to force creativity/paraphrasing
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
