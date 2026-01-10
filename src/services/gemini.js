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
                    ACTUAR COMO: Asistente de Referencias Bíblicas.
                    OBJETIVO: Extraer SOLO LAS CITAS de las lecturas (Copyright Bypass).
                    FECHA: ${safeDate}.
                    
                    INSTRUCCIONES DE EMERGENCIA:
                    GOOGLE HA BLOQUEADO EL TEXTO.
                    SOLUCIÓN: PARAFRASEA EL TEXTO BÍBLICO (Explica el contenido con tus propias palabras).
                    NO uses citas textuales directas si eso dispara el filtro.
                    Usa como base mental la versión TORRES AMAT (1825).
                    
                    FORMATO OBLIGATORIO (PARÁFRASIS):
                    [[LECTURA_1]]
                    (Cita Exacta: Libro Cap, vers-vers)
                    > (Parafraseo fiel del contenido...)

                    [[SALMO]]
                    (Cita Exacta)
                    > (Parafraseo fiel del Salmo...)

                    [[LECTURA_2]]
                    (Cita Exacta)
                    > (Parafraseo fiel del contenido...)

                    [[EVANGELIO]]
                    (Cita Exacta)
                    > (Parafraseo fiel del Evangelio...)
                    `;
                } else {
                    // Default Structure Rescue (Clean Slate)
                    cleanSlatePrompt = `
                    ACTUAR COMO: Asistente Litúrgico.
                    CONTEXTO: ${safeDate}.
                    OBJETIVO: Generar el esquema de la Santa Misa.
                    CRÍTICO: Google ha bloqueado los textos bíblicos por Copyright. NO LOS ESCRIBAS LITERALMENTE.

                    INSTRUCCIONES DE ESTILO "HIGH CHURCH" (OBLIGATORIO):
                    1. TITULACIÓN: Usa Títulos en LATÍN y ESPAÑOL (Ej: RITUS INITIALES / Ritos Iniciales).
                    2. ORACIONES DEL SACERDOTE (Colecta, Ofertorio, Post-comunión):
                       - DEBEN estar dentro de un BLOQUE DE CITA (Markdown '>') para que salgan con borde rojo.
                       - Ej:
                         > Oh Dios, que... (Texto de la oración) ... Por Jesucristo nuestro Señor.
                    
                    INSTRUCCIONES DE EMERGENCIA (MODO "CREATIVO / SIN COPYRIGHT"):
                    1. Genera TODA la estructura.
                    2. LECTURAS:
                       - USA MARCADOR: [[LECTURA_1]], [[LECTURA_2]], [[EVANGELIO]].
                       - ⛔ PROHIBIDO CITAR TEXTO BÍBLICO.
                       - Escribe: "Resumen: [Parafrasea la idea central en 2 líneas con tus propias palabras]".

                    3. PARA EL SALMO (OBLIGATORIO: ESTRUCTURA RESPONSORIAL):
                       - [[SALMO]]
                       - R. [Antífona breve]
                       - V. [Resumen de la estrofa]
                       - R. [Antífona]

                    4. USA MARCADORES para oraciones fijas:
                       - [[INSERTAR_YO_CONFIESO]]
                       - [[INSERTAR_GLORIA]] (Si es Festivo/Domingo)
                       - [[INSERTAR_CREDO]] (Si es Festivo/Domingo)
                       - [[INSERTAR_SANTO]]
                       - [[INSERTAR_PADRE_NUESTRO]]
                       - ESCRIBE: "Líbranos de todos los males, Señor..." (Embolismo completo)
                       - ESCRIBE: "Tuyo es el reino, tuyo el poder..." (Doxología completa)
                       - [[INSERTAR_CORDERO]]

                    5. ORACIÓN DE LOS FIELES (TEMA OBLIGATORIO):
                       - Deben estar basadas en las LECTURAS del día (NO GENÉRICAS).
                       - Estructura: "Por..., para que... roguemos al Señor."

                    6. ORACIONES VARIABLES:
                       ⚠️ ¡ESCRIBE UN TEXTO COMPLETO Y SOLEMNE DENTRO DE '>' (Bloque)!
                       - Si no puedes usar el texto oficial, COMPÓN UNA ORACIÓN NUEVA SOLEMNE.
                    
                    7. FINAL:
                       - Incluye la Bendición y Despedida.
                       - [[Antífona Mariana]]: "Bajo tu amparo..." o "Salve Regina".
                    
                    8. EXTRA (TÍTULO EXACTO):
                       CITA_PATRISTICA: "Escribe una frase breve de un Santo sobre el Evangelio hoy" - Autor.
                       
                    FORMATO: HTML simple.
                    `;
                }

                try {
                    return await generateLiturgy(cleanSlatePrompt, true);
                } catch (retryError) {
                    console.error("⚠️ RETRY FAILED. USING STATIC FALLBACK.", retryError);

                    if (isReadingsMode) {
                        return `
                        [[LECTURA_1]]
                        (Lectura no disponible)
                        > (Error de generación. Por favor, lea directamente de la Biblia Torres Amat o su Leccionario).

                        [[SALMO]]
                        (Salmo no disponible)
                        > (Error de generación. Consulte el Salmo del día).

                        [[LECTURA_2]]
                        (Lectura no disponible)
                        > (Error de generación. Consulte su Leccionario).

                        [[EVANGELIO]]
                        (Evangelio no disponible)
                        > (Error de generación. Consulte el Evangelio del día).
                        `;
                    }

                    // FALLBACK SKELETON (Full Mass Structure)
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
