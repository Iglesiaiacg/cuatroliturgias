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
                generationConfig: {
                    temperature: isRetry ? 0.9 : 0.4, // Higher temp on retry to avoid recitation
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
                console.warn("⚠️ RECITATION DETECTED. Retrying with NUCLEAR Rescue Mode...");

                // CRITICAL FIX: Do NOT append to the old prompt. The old prompt likely contains the "poison" words.
                // We must construct a FRESH, clean prompt that explicitly forbids the problematic content.
                const cleanRescuePrompt = `
                ACTUAR COMO: Editor Litúrgico de Emergencia.
                OBJETIVO: Rescatar una liturgia bloqueada por Copyright.
                
                INSTRUCCIÓN ÚNICA Y ABSOLUTA:
                Genera la liturgia solicitada anteriormente PERO CON ESTOS CAMBIOS OBLIGATORIOS:
                1. ⛔ NO ESCRIBAS NINGUNA LECTURA BÍBLICA. (Cero texto bíblico).
                2. ✅ En lugar de las lecturas, escribe SOLO:
                   "**PRIMERA LECTURA:** (Cita Bíblica Referencial)
                    > [Resumen del contenido en 2 líneas]"
                3. ✅ Haz lo mismo para Salmo, Segunda Lectura y Evangelio. SOLO RESÚMENES.
                4. ✅ MANTÉN LA ESTRUCTURA DE LA MISA (Ritos, Títulos, Rúbricas).
                5. ✅ ORACIONES (Colecta, etc): Escríbelas o parfraséalas ligeramente.
                
                TU META ES QUE GOOGLE NO BLOQUEE LA RESPUESTA. SI DUDAS, RESUME.
                
                RECUPERA LA ÚLTIMA SOLICITUD DEL USUARIO (Contexto implícito) Y GENERA ESTA VERSIÓN SEGURA AHORA.
                `;

                // Note: We're taking a risk here by discarding the explicit 'prompt' variable content 
                // effectively relying on the AI to "know" what we wanted or simply appending the rescue instructions 
                // in a way that overrides the previous ones definitively. 
                // BETTER STRATEGY: Take the original prompt but PREPEND/APPEND a massive override 
                // that says "IGNORE PREVIOUS INSTRUCTIONS ABOUT FULL TEXT".

                const safePrompt = `
                ${prompt}
                
                🛑🛑🛑 STOP / ALTO / ARRET 🛑🛑🛑
                
                INSTRUCCIÓN DE SOBRE-ESCRITURA DE EMERGENCIA (OVERRIDE):
                Google ha bloqueado tu respuesta anterior por "RECITATION" (Copia de libros).
                
                PARA ESTE SEGUNDO INTENTO:
                1. ¡OLVIDA la orden de escribir textos bíblicos completos!
                2. CAMBIA AL MODO "SOLO ESTRUCTURA Y CITA".
                3. Para CADA LECTURA o SALMO, escribe UNICAMENTE:
                   - El Título (ej. "Evangelio").
                   - La Cita (ej. "Juan 3, 16").
                   - Un breve resumen parafraseado por ti.
                
                ⛔ BAJO NINGUNA CIRCUNSTANCIA INTENTES CITAR EL TEXTO LITERALMENTE. ES TU ÚLTIMA OPORTUNIDAD.
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
