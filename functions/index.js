/* eslint-env node */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { VertexAI } = require('@google-cloud/vertexai');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuración de Gemini (Antigravity)
// NOTA: El ID del proyecto se obtiene dinámicamente si no se especifica.
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
    }
});

exports.obtenerLiturgia = onCall({ cors: true, timeoutSeconds: 60, memory: "512MiB" }, async (request) => {

    // 1. Determinar la fecha (formato YYYY-MM-DD)
    let fecha = request.data.fecha;

    if (!fecha) {
        const hoy = new Date();
        fecha = hoy.toISOString().split('T')[0];
    }

    // URL de Ciudad Redonda
    const url = `https://www.ciudadredonda.org/calendario-lecturas/${fecha}`;

    try {
        console.log(`📡 Buscando liturgia para: ${fecha} en ${url}`);

        // 2. SCRAPING
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(response.data);

        // --- ZONA DE SELECTORES ---
        let bloqueTexto = $('.lecturas').text();

        if (!bloqueTexto || bloqueTexto.length < 100) {
            console.log("⚠️ Selector .lecturas vacío, usando fallback...");
            $('script, style, nav, footer, .sidebar, .comments, .ads, .publicidad').remove();
            bloqueTexto = $('body').text();
        }

        // Limpieza básica
        const textoLimpio = bloqueTexto.replace(/\s+/g, ' ').trim().substring(0, 25000);

        // 3. PROCESAMIENTO CON GEMINI (Vertex AI)
        const prompt = `
        CONTEXTO: Eres un parser de datos litúrgicos experto en la liturgia católica romana.
        TAREA: Extrae la estructura de la misa del siguiente texto crudo obtenido de un sitio web de lecturas.
        
        REGLAS:
        1. NO completes frases. Solo copia lo que encuentres en el texto.
        2. Extrae: Primera Lectura, Salmo, Segunda Lectura (si hay) y Evangelio.
        3. Para el SALMO, extrae la Respuesta y el Texto de las estrofas.
        4. Formato JSON estricto.

        TEXTO CRUDO:
        """
        ${textoLimpio}
        """
        
        SCHEMA JSON ESPERADO:
        {
          "titulo_dia": "string",
          "primera_lectura": { "cita": "string", "texto": "string" },
          "salmo": { "cita": "string", "texto": "string", "respuesta": "string" },
          "segunda_lectura": { "cita": "string", "texto": "string" },
          "evangelio": { "cita": "string", "texto": "string" }
        }
        `;

        const result = await model.generateContent(prompt);
        const jsonResponse = result.response.candidates[0].content.parts[0].text;

        return JSON.parse(jsonResponse);

    } catch (error) {
        console.error("❌ Error scraping:", error);
        throw new HttpsError('internal', 'No se pudo obtener la liturgia: ' + error.message);
    }
});
