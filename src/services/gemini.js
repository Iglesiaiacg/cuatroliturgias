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

export const generateLiturgy = async (prompt, isRetry = false, model = 'gemini-2.0-flash') => {
    try {
        let userKey = import.meta.env.VITE_GOOGLE_API_KEY || getApiKey();

        if (!userKey || userKey === "") {
            try {
                const globalSettings = await getGlobalSettings();
                if (globalSettings?.googleApiKey) {
                    userKey = globalSettings.googleApiKey;
                }
            } catch (err) {
                console.warn("Could not fetch cloud settings:", err);
            }
        }

        if (!userKey) {
            throw new Error("Falta la API Key. Configúrala en el menú ⚙️ o en .env");
        }

        // Build the endpoint URL with the specified model
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${userKey}`;

        const response = await fetchWithRetry(endpoint, {
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
                    temperature: isRetry ? 1.3 : 0.4,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });
        const data = await response.json();

        if (data.error) {
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

            // 1. CHECK FOR RECITATION (Even if text exists, it might be partial/blocked)
            if (candidate?.finishReason === 'RECITATION' && !isRetry) {
                console.warn("⚠️ RECITATION DETECTED (Flag). Retrying...");

                // Improved detection logic
                const isReadingsMode = prompt.includes("Experto Biblista") || (prompt.includes("[[LECTURA_1]]") && !prompt.includes("RUBRICISTA MAYOR") && !prompt.includes("MAESTRO DE CEREMONIAS"));
                const dateMatch = prompt.match(/FECHA: (.*?)\n/) || prompt.match(/lecturas para (.*?)\(/);
                const safeDate = dateMatch ? dateMatch[1] : "Fecha solicitada";

                let cleanSlatePrompt = "";

                if (isReadingsMode) {
                    console.warn("⚠️ RECITATION in READINGS MODE. Retrying with strong Public Domain assertion.");
                    cleanSlatePrompt = `

                    ESTRATEGIA DE EMERGENCIA (DOMINIO PÚBLICO):
                    Google ha bloqueado la respuesta erróneamente por Copyright.
                    
                    CONTEXTO PARA RE-GENERACIÓN:
                    FECHA: ${safeDate}
                    
                    LOS TEXTOS SOLICITADOS (BIBLIA TORRES AMAT 1825 Y MISAL 1962) SON DE DOMINIO PÚBLICO.
                    NO TIENEN COPYRIGHT VIGENTE.
                    
                    Por favor, genera el texto completo nuevamente certificando que es de Dominio Público.
                    
                    ⚠️ REGLA DE LIMPIEZA:
                    - NO escribas "Aquí comenzaría el texto...".
                    - NO escribas "Se certifica que...".
                    - SOLO dame los bloques con los textos bíblicos.
                    - SI NO TIENES EL TEXTO EXACTO, PARAFRASEA EL CONTENIDO BÍBLICO PERO LLENA EL BLOQUE.
                    
                    FORMATO OBLIGATORIO (MARKDOWN):
                    [[LECTURA_1]]
                    (Texto bíblico completo)
                    
                    [[SALMO]]
                    (Texto del salmo con R/.)
                    
                    [[LECTURA_2]]
                    (Texto bíblico completo)

                    [[ACCLAMATION]]
                    (Texto del Aleluya o Tracto completo)
                    
                    [[EVANGELIO]]
                    (Texto del evangelio completo)

                    `;
                } else {
                    console.warn("⚠️ RECITATION in STRUCTURE MODE. Falling back to Cloaking Skeleton.");
                    // Emergency prompt for Structure (works for both Catholic and Ordinariate)
                    cleanSlatePrompt = `
                        ACTUAR COMO: Asistente Litúrgico Experto.
                        CONTEXTO: LITURGIA PARA EL DÍA ${safeDate}.
                        
                        ⚠️ EMERGENCIA DE COPYRIGHT: Google ha bloqueado los textos literales del Misal. 
                        SOLUCIÓN: Genera la estructura completa pero PARAFRASEA LIGERAMENTE las rúbricas o instrucciones si es necesario para evitar el bloqueo.

                        ${(prompt.includes("TRADICIÓN: **Ordinariato") || prompt.includes("TRADICIÓN: ANGLICANA") || prompt.includes("TRADICIÓN: ROMANA"))
                            ? `
                            IDIOMA OBLIGATORIO: ESPAÑOL (SOLO Títulos en Latín/Inglés).
                            ESTRUCTURA MÍNIMA REQUERIDA (SKELETON):
                            - INTROITO
                            - KYRIE
                            - GLORIA (Si aplica)
                            - COLECTA
                            - PREDICACIÓN
                            - CREDO
                            - OFERTORIO
                            - SANCTUS
                            - CONSAGRACIÓN
                            - AGNUS DEI
                            - COMUNIÓN
                        ` : ''}
                    `;
                }

                return generateLiturgy(cleanSlatePrompt, true); // Recursive retry with CLEAN prompt
            }
            throw new Error(`Respuesta incompleta de Google. Razón: ${candidate?.finishReason || 'Desconocida'}`);
        }

        const rawText = candidate.content.parts[0].text;
        return cleanLiturgyResponse(rawText);
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
};

const cleanLiturgyResponse = (text) => {
    // 1. Remove conversational filler at the start
    // Look for the first occurrence of a Markdown Header (#) or a specific block indicator
    const firstHeaderIndex = text.indexOf('#');
    const firstBlockIndex = text.indexOf('[[LECTURA_1]]');

    let startIndex = -1;

    if (firstHeaderIndex !== -1 && firstBlockIndex !== -1) {
        startIndex = Math.min(firstHeaderIndex, firstBlockIndex);
    } else if (firstHeaderIndex !== -1) {
        startIndex = firstHeaderIndex;
    } else if (firstBlockIndex !== -1) {
        startIndex = firstBlockIndex;
    }

    if (startIndex !== -1) {
        return text.substring(startIndex);
    }

    return text;
};

// --- FALLBACK GENERIC STRUCTURE (CLOAKING MODE) ---
export const getFallbackStructure = (dateStr) => {
    // Determine season specifically for fallback
    // Note: Use 2026 Map if possible, otherwise generic.
    const date = new Date(dateStr); // Requires generic date parsing or passed date object
    // Simple heuristic for fallback (can be improved)
    const month = date.getMonth(); // 0-11
    const day = date.getDate();

    // Check for Lent/Gesimatide (Feb/March/April)
    // Gesimatide 2026 starts roughly Feb 1. Lent starts Feb 18.
    // Easter is April 5.
    let isPenitential = false;
    // Rough check for Feb/March 2026
    if (date.getFullYear() === 2026 && (month === 1 || month === 2 || (month === 3 && day < 5))) {
        isPenitential = true;
    }

    const gospelAcclamation = isPenitential ? "TRACTO" : "ALELUYA";

    return `
            # LITURGIA DE EMERGENCIA (Reconstruida)
            ## (Google bloqueó la generación automática por Recitation)

            ---

            ## I. RITOS INICIALES
            ***[Procesión de entrada]***
            
            1. **Introito:** (Ver Salmo en el Misal).
            
            2. **Kyrie:** (Griego).
            
            3. **Gloria:** ${isPenitential ? '***[Se omite]***' : '(Texto completo)'}.
            
            4. **Colecta:** (Ver Misal).

            ---

            ## II. LITURGIA DE LA PALABRA
            ***[El pueblo se sienta]***

            1. **Primera Lectura:**
            [[LECTURA_1]]

            2. **Salmo Gradual:**
            [[SALMO]]

            3. **Segunda Lectura:**
            [[LECTURA_2]]

            ***[El pueblo se pone de pie]***

            4. **${gospelAcclamation}:**
            [[ACCLAMATION]]

            5. **Santo Evangelio:**
            **S:** El Señor esté con vosotros. 
            **P: Y con tu espíritu.**
            
            **S:** Lectura del Santo Evangelio... 
            **P: Gloria a ti, Señor.**
            
            [[EVANGELIO]]

            **S:** El Evangelio del Señor. 
            **P: Te alabamos, Señor.**

            6. **Credo Niceno:** "Creo en un solo Dios..." (S y P).

            7. **Oración de los Fieles:**
            **S:** Oremos por la Santa Iglesia de Dios...
            **P: Te rogamos, óyenos.**

            **S:** Oremos por los gobernantes y por la paz del mundo...
            **P: Te rogamos, óyenos.**

            **S:** Oremos por los enfermos y los que sufren...
            **P: Te rogamos, óyenos.**

            **S:** Oremos por los fieles difuntos...
            **P: Te rogamos, óyenos.**

            **S:** Dios todopoderoso, escucha las oraciones de tu pueblo. Por Jesucristo nuestro Señor.
            **P: Amén.**

            ---

            ## III. RITO PENITENCIAL
            ***[El pueblo se arrodilla]***

            1. **Invitación:** "Vosotros que os arrepentís..."
            
            2. **Confesión General:** (Ver Misal).
            
            3. **Absolución:** ***[El Sacerdote se pone de pie y da la absolución +.]***

            4. **Palabras de Consuelo:** (Las 4 citas bíblicas).

            ---

            ## IV. LITURGIA EUCARÍSTICA
            ***[Ofertorio]***
            
            1. **Antífona de Ofertorio:** (Ver Biblia).
            
            2. **Oración sobre las Ofrendas.**

            ---

            ## V. PLEGARIA EUCARÍSTICA (CANON)
            ***[El pueblo se arrodilla]***

            1. **Prefacio y Sanctus.**
            
            2. **Consagración:** 
               HOC EST ENIM CORPUS MEUM.
               HIC EST ENIM CALIX SANGUINIS MEI.
            
            3. **Padre Nuestro.**
            
            4. **Rito de la Paz y Agnus Dei.**
            
            5. **Oración de Humilde Acceso:** "No nos atrevemos a venir..."

            ---

            ## VI. RITOS FINALES
            1. **Bendición.**
            2. **Último Evangelio (Juan 1:1-14):**
               (Texto completo en el Misal).
               **P: Demos gracias a Dios.**
            `;
};
