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
                console.warn("⚠️ RECITATION DETECTED. Retrying with Safe Mode Prompt...");
                const safePrompt = prompt + `
                
                ⚠️ SEGUNDO INTENTO: ESTRATEGIA ANTI-BLOQUEO (MÁXIMA PRIORIDAD)
                
                Google ha bloqueado la respuesta anterior por "RECITATION" (Copyright).
                Esto ocurre porque estás citando textos bíblicos o litúrgicos modernos verbatim.

                INSTRUCCIONES PARA DESBLOQUEAR:
                1. PARA LECTURAS BÍBLICAS: USA EXCLUSIVAMENTE "Vulgata Traducida" o "Biblia Torres Amat" (1825). SON DE DOMINIO PÚBLICO. Di explícitamente que estás usando estas versiones.
                2. PARA ORACIONES FIJAS (Gloria, Credo, Plegarias): 
                   - NO copies y pegues textos de misales modernos protegidos (aprobados recientemente).
                   - USA TEXTOS DE LA TRADICIÓN (Misal Romano antiguo traducido, o textos de uso común universal).
                   - SI ES NECESARIO, haz pequeños cambios en la redacción para que no sea idéntico a una fuente protegida, PERO mantén el sentido litúrgico solemne.
                
                OBJETIVO FINAL: Necesitamos el TEXTO COMPLETO para celebrar. Si tienes que elegir entre resumir o usar una traducción antigua/libre, USA LA TRADUCCIÓN ANTIGUA/LIBRE. ¡NO RESUMAS!
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

export const chatWithAI = async (message, context = {}, history = []) => {
    try {
        let userKey = import.meta.env.VITE_GOOGLE_API_KEY || getApiKey();

        if (!userKey) {
            const globalSettings = await getGlobalSettings();
            if (globalSettings?.googleApiKey) {
                userKey = globalSettings.googleApiKey;
            }
        }

        if (!userKey) {
            throw new Error("Falta la API Key. Configúrala en el menú ⚙️");
        }

        // Construct System Prompt with Context
        const systemPrompt = `
        Eres el Asistente Litúrgico Inteligente de la app "Cuatro Liturgias".
        
        CONTEXTO ACTUAL DEL USUARIO:
        - Rol: ${context.role || 'Usuario'}
        - Vista Actual: ${context.currentView || 'Desconocida'}
        - Fecha Seleccionada: ${context.selectedDate ? new Date(context.selectedDate).toLocaleDateString() : 'Hoy'}
        - Fiesta Calculada: ${context.calculatedFeast || 'Ninguna'}
        
        CAPACIDADES:
        1. Responder preguntas sobre liturgia, el calendario, o el funcionamiento de la app.
        2. Navegar por la app ("Ir a...").
        3. Realizar acciones de CAMBIO DE DATOS (Crear, Editar, Borrar) en: Calendario y Directorio de Fieles.
        
        FORMATO DE RESPUESTA:
        Si solo respondes texto, envía texto plano.
        
        SI EL USUARIO PIDE UNA ACCIÓN (Navegar o Modificar Datos), responde EXCLUSIVAMENTE un JSON con este formato:
        
        {
            "action": "NAVIGATE", // o "CREATE", "UPDATE", "DELETE"
            "target": "calendario", // o "fieles", "sacristia"
            "data": { ... }, // Datos para la acción (solo para CREATE/UPDATE/DELETE)
            "message": "Texto que explica qué harás (para la confirmación)"
        }
        
        EJEMPLOS DE ACCIONES:
        1. NAVEGACIÓN:
           { "action": "NAVIGATE", "target": "calendar", "message": "Yendo al calendario." }
           
        2. CREAR EVENTO (Calendario):
           { 
             "action": "CREATE", 
             "target": "calendario", 
             "data": { "title": "Ensayo Coro", "date": "2024-12-24T17:00:00", "type": "meeting" }, 
             "message": "Voy a agendar 'Ensayo Coro' para el 24 de Diciembre a las 5pm." 
           }
           
        3. BORRAR FIEL (Directorio):
           // Solo si tienes el ID, si no, pregunta primero o busca contexto.
           { 
             "action": "DELETE", 
             "target": "fieles", 
             "data": { "id": "USER_ID_123" }, 
             "message": "Voy a eliminar permanentemente al fiel con ID USER_ID_123." 
           }

        IMPORTANTE:
        - Sé breve y servicial.
        - Si el usuario pide borrar/crear y NO tienes detalles claros (hora, fecha, nombre completo), PREGUNTA antes de generar el JSON.
        - Para fechas, usa formato ISO (YYYY-MM-DD).
        `;

        // Format History for Gemini (User/Model turns)
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] }, // System instruction as first user msg mostly works well or separate system instruction
            ...history.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await fetchWithRetry(`${CONFIG.ENDPOINTS.GENERATE}?key=${userKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
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
            throw new Error(data.error.message || "Error de IA");
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Sin respuesta de IA");

        // Try parsing as JSON for Actions
        try {
            // Clean markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
                return JSON.parse(cleanText);
            }
        } catch (e) {
            // Not JSON, return text
        }

        return { text: text };

    } catch (e) {
        console.error("AI Chat Error:", e);
        throw e;
    }
};
