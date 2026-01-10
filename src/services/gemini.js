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
                console.warn("⚠️ RECITATION DETECTED. Retrying with CLEAN SLATE Strategy...");

                // STRATEGY CHANGE: Context-Aware Rescue
                const isReadingsMode = prompt.includes("Experto Biblista");

                // Extract minimal context
                const dateMatch = prompt.match(/FECHA: (.*?)\n/);
                const safeDate = dateMatch ? dateMatch[1] : "Fecha solicitada";

                let cleanSlatePrompt = "";

                if (isReadingsMode) {
                    console.warn("⚠️ RECITATION in READINGS MODE. Falling back to Summaries.");
                    cleanSlatePrompt = `
                    ACTUAR COMO: Experto Biblista.
                    OBJETIVO: Resumir lecturas bloqueadas por Copyright.
                    FECHA: ${safeDate}.
                    
                    INSTRUCCIONES DE EMERGENCIA:
                    Google ha bloqueado el texto exacto.
                    Genera SOLO la estructura de marcadores con RESÚMENES BREVES.
                    
                    FORMATO OBLIGATORIO:
                    [[LECTURA_1]]
                    (Cita)
                    > (Resumen breve del contenido...)

                    [[SALMO]]
                    (Cita)
                    > (Resumen breve...)

                    [[LECTURA_2]]
                    (Cita)
                    > (Resumen breve...)

                    [[EVANGELIO]]
                    (Cita)
                    > (Resumen breve...)
                    `;
                } else {
                    // Default Structure Rescue (Clean Slate)
                    cleanSlatePrompt = `
                    ACTUAR COMO: Asistente Litúrgico.
                    CONTEXTO: ${safeDate}.
                    OBJETIVO: Generar el esquema de la Santa Misa SIN TEXTOS BÍBLICOS, pero con ORACIONES COMPLETAS.
                    
                    INSTRUCCIONES DE EMERGENCIA:
                    1. Genera TODA la estructura (Ritos, Eucaristía) formato GUIÓN CON DIÁLOGOS COMPLETOS.
                    2. USA MARCADORES para lecturas: [[LECTURA_1]], [[SALMO]], [[LECTURA_2]], [[EVANGELIO]].
                    3. USA MARCADORES para oraciones fijas (OBLIGATORIO):
                       - [[INSERTAR_YO_CONFIESO]]
                       - [[INSERTAR_GLORIA]] (Si es Festivo/Domingo)
                       - [[INSERTAR_CREDO]] (Si es Festivo/Domingo)
                       - [[INSERTAR_SANTO]]
                       - [[INSERTAR_PADRE_NUESTRO]]
                       - [[INSERTAR_CORDERO]]
                    
                    4. ORACIONES VARIABLES (Colecta, Ofrendas, Post-comunión):
                       ⚠️ ¡ESCRIBE UN TEXTO COMPLETO Y SOLEMNE!
                       - NO pongas "(Parafraseada)" ni resúmenes.
                       - Si no puedes usar el texto oficial por Copyright, COMPÓN UNA ORACIÓN TOTALMENTE NUEVA y adecuada al tema del día.
                       
                    FORMATO: HTML simple.
                    `;
                }

                try {
                    return await generateLiturgy(cleanSlatePrompt, true);
                } catch (retryError) {
                    console.error("⚠️ RETRY FAILED. USING STATIC FALLBACK.", retryError);
                    // FALLBACK SKELETON: If even the "Clean Slate" fails, return a safe, static HTML skeleton.
                    return `
                    <h3>RITOS INICIALES</h3>
                    <em>(Generación automática bloqueada. Use este esquema manual).</em>
                    <p><strong>Antífona de Entrada:</strong> (Ver Misal).</p>
                    <p><strong>Acto Penitencial:</strong> Yo confieso...</p>
                    <p><strong>Oración Colecta:</strong> (Ver Misal).</p>

                    <hr />

                    <h3>LITURGIA DE LA PALABRA</h3>
                    <em>Nota: Google ha bloqueado los textos por Copyright. Por favor, lea desde su leccionario.</em>
                    
                    <p><strong>PRIMERA LECTURA</strong><br/>
                    <em>Lectura del Antiguo Testamento.</em></p>

                    <p><strong>SALMO RESPONSORIAL</strong><br/>
                    <em>(Salmo del día).</em></p>

                    <p><strong>SEGUNDA LECTURA</strong><br/>
                    <em>Lectura del Nuevo Testamento.</em></p>

                    <p><strong>EVANGELIO</strong><br/>
                    <em>Lectura del Santo Evangelio.</em></p>

                    <hr />

                    <h3>LITURGIA EUCARÍSTICA</h3>
                    <p><strong>Ofertorio:</strong> Bendito seas, Señor...</p>
                    <p><strong>Oración sobre las ofrendas:</strong> (Ver Misal).</p>
                    <p><strong>Prefacio y Santo:</strong> Santo, Santo, Santo...</p>
                    <p><strong>Consagración y Plegaria Eucarística.</strong></p>

                    <hr />

                    <h3>RITO DE COMUNIÓN</h3>
                    <p><strong>Padre Nuestro.</strong></p>
                    <p><strong>Cordero de Dios.</strong></p>
                    <p><strong>Comunión.</strong></p>
                    <p><strong>Oración post-comunión:</strong> (Ver Misal).</p>
                    `;
                }
            }

            throw new Error(`Respuesta incompleta de Google. Razón: ${candidate?.finishReason || 'Desconocida'}. Revisa la consola.`);
        }

        return candidate.content.parts[0].text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
};
