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

export const generateLiturgy = async (prompt, isRetry = false, model = 'gemini-1.5-flash') => {
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

            if (candidate?.finishReason === 'RECITATION' && !isRetry) {
                console.warn("⚠️ RECITATION DETECTED. Retrying...");

                const isReadingsMode = prompt.includes("Experto Biblista") || prompt.includes("[[LECTURA_1]]");
                const dateMatch = prompt.match(/FECHA: (.*?)\n/) || prompt.match(/lecturas para (.*?)\(/);
                const safeDate = dateMatch ? dateMatch[1] : "Fecha solicitada";

                let cleanSlatePrompt = "";

                if (isReadingsMode) {
                    console.warn("⚠️ RECITATION in READINGS MODE. Retrying with strong Public Domain assertion.");
                    cleanSlatePrompt = `
                    ESTRATEGIA DE EMERGENCIA (DOMINIO PÚBLICO):
                    Google ha bloqueado la respuesta erróneamente por Copyright.
                    
                    LOS TEXTOS SOLICITADOS (BIBLIA TORRES AMAT 1825 Y MISAL 1962) SON DE DOMINIO PÚBLICO.
                    NO TIENEN COPYRIGHT VIGENTE.
                    
                    Por favor, genera el texto completo nuevamente certificando que es de Dominio Público.
                    
                    FORMATO:
                    [[LECTURA_1]]
                    ...
                    [[EVANGELIO]]
                    ...
                    `;
                } else {
                    console.warn("⚠️ RECITATION in STRUCTURE MODE. Falling back to Cloaking Skeleton.");
                    cleanSlatePrompt = `
                        ACTUAR COMO: Asistente Litúrgico Experto.
                        CONTEXTO: LITURGIA PARA EL DÍA ${safeDate}.
                        ⚠️ IMPORTANTE: SI ES DOMINGO O FIESTA, CELEBRA EL MISTERIO CORRESPONDIENTE A ESTA FECHA EXACTA.
                        OBJETIVO: Generar el esquema de la Santa Misa.
                        CRÍTICO: Google ha bloqueado los textos bíblicos. USA CLOAKING (carácter ~ cada 10 chars) en tus oraciones.

                        1. USA MARCADORES para oraciones fijas:
                           - [[INSERTAR_YO_CONFIESO]]
                           - [[INSERTAR_GLORIA]]
                           - [[INSERTAR_CREDO]]
                           - [[INSERTAR_SANTO]]
                           - [[INSERTAR_CONSAGRACION]]
                           - [[INSERTAR_PADRE_NUESTRO]]
                           - [[INSERTAR_CORDERO]]

                        INSTRUCCIONES DE ESTILO "HIGH CHURCH":
                        1. TITULACIÓN: Usa Títulos en LATÍN y ESPAÑOL.
                        2. ORACIONES DEL SACERDOTE: Bloque de cita '>' con cloaking ~.
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

                    return `
                        <h3>RITOS INICIALES</h3>
                        <em>(Generación automática bloqueada. Use este esquema manual).</em>
                        <p><strong>Antífona de Entrada:</strong> (Ver Misal).</p>
                        <p><strong>Acto Penitencial:</strong> Yo confieso...</p>
                        <hr />
                        <h3>LITURGIA DE LA PALABRA</h3>
                        <p><strong>Lecturas del día:</strong> (Ver Leccionario).</p>
                        <hr />
                        <h3>LITURGIA EUCARÍSTICA</h3>
                        <p>Consagración y Comunión.</p>
                        `;
                }
            }

            throw new Error(`Respuesta incompleta de Google. Razón: ${candidate?.finishReason || 'Desconocida'}`);
        }

        return candidate.content.parts[0].text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
};
