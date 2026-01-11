/**
 * Generate liturgical elements specific to the feast/season
 * Includes: Preface, Proper Prayers, Antiphons
 */

/**
 * Determine liturgical color for the day
 * @param {Date} date - The liturgical date
 * @param {string} feastLabel - Name of the feast
 * @param {string} season - Liturgical season
 * @returns {Object} - Color name and emoji
 */
export const getLiturgicalColor = (date, feastLabel, season) => {
    const lower = feastLabel.toLowerCase();

    // Red - Martyrs, Pentecost, Holy Week
    if (lower.includes('mártir') || lower.includes('pentecostés') ||
        lower.includes('pasión') || lower.includes('cruz') ||
        lower.includes('espíritu santo')) {
        return { color: 'Rojo', emoji: '🔴', season: 'martyrs/pentecost' };
    }

    // White - Christmas, Easter, Mary, Angels, Saints (non-martyrs)
    if (season === 'navidad' || season === 'pascua' ||
        lower.includes('navidad') || lower.includes('epifanía') ||
        lower.includes('pascua') || lower.includes('ascensión') ||
        lower.includes('santísima trinidad') || lower.includes('corpus') ||
        lower.includes('maría') || lower.includes('ángel') ||
        lower.includes('bautismo del señor')) {
        return { color: 'Blanco', emoji: '⚪', season: 'christmas/easter/feasts' };
    }

    // Violet - Advent, Lent
    if (season === 'adviento' || season === 'cuaresma') {
        return { color: 'Morado', emoji: '🟣', season: 'advent/lent' };
    }

    // Rose - 3rd Sunday of Advent (Gaudete), 4th Sunday of Lent (Laetare)
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month === 12 && day >= 11 && day <= 17) || // Approx 3rd Advent
        (month === 3 && day >= 15 && day <= 22)) {  // Approx 4th Lent
        return { color: 'Rosado', emoji: '🌸', season: 'gaudete/laetare' };
    }

    // Green - Ordinary Time (default)
    return { color: 'Verde', emoji: '🟢', season: 'ordinary' };
};

/**
 * Generate Preface for the feast
 * @param {string} feastLabel - Name of the feast
 * @param {string} gospel - Gospel text
 * @param {string} season - Liturgical season
 * @returns {Promise<string>} - Generated Preface
 */
export const generatePreface = async (feastLabel, gospel, season) => {
    const { generateLiturgy } = await import('./gemini.js');

    const prompt = `
Eres un liturgista católico experto. Genera el PREFACIO completo para la Plegaria Eucarística.

**Celebración:** ${feastLabel}
**Tiempo Litúrgico:** ${season}
**Evangelio del día:** ${gospel?.substring(0, 500) || 'No disponible'}

**INSTRUCCIONES:**
1. Genera el prefacio específico para esta celebración
2. Debe comenzar después del diálogo inicial (que ya está incluido)
3. Formato litúrgico exacto:
   - Comienza con: "En verdad es justo y necesario..."
   - Expone el misterio teológico del día
   - Termina con: "...Por eso, con los ángeles y los santos, te cantamos el himno de alabanza, diciendo sin cesar:"
4. Usa lenguaje litúrgico solemne y tradicional
5. Máximo 150 palabras

**GENERA SOLO EL TEXTO DEL PREFACIO, sin títulos ni explicaciones:**
`;

    try {
        const preface = await generateLiturgy(prompt);
        return preface.trim();
    } catch (error) {
        console.error('Error generating Preface:', error);
        // Generic Preface fallback
        return `En verdad es justo y necesario, es nuestro deber y salvación darte gracias siempre y en todo lugar, Señor, Padre santo, Dios todopoderoso y eterno, por Cristo, Señor nuestro.

Quien, siendo eterno, se hizo hombre para redimirnos; siendo rico, se hizo pobre para enriquecernos con su pobreza; y siendo Rey del universo, se anonadó tomando la condición de siervo.

Por eso, con los ángeles y los santos, te cantamos el himno de alabanza, diciendo sin cesar:`;
    }
};

/**
 * Generate Proper Prayers for the day
 * @param {string} feastLabel - Name of the feast
 * @param {Object} readings - Evangelizo readings
 * @returns {Promise<Object>} - Collect, Offerings, Post-Communion
 */
export const generateProperPrayers = async (feastLabel, readings) => {
    const { generateLiturgy } = await import('./gemini.js');

    const prompt = `
Eres un liturgista católico experto. Genera las 3 ORACIONES PROPIAS para esta celebración.

**Celebración:** ${feastLabel}
**Evangelio:** ${readings.evangelio?.substring(0, 300) || 'No disponible'}

**INSTRUCCIONES:**
1. Genera exactamente 3 oraciones litúrgicas:
   - COLECTA (después de "Oremos")
   - SOBRE LAS OFRENDAS (antes del Prefacio)
   - POSTCOMUNIÓN (después de la Comunión)

2. Cada oración debe:
   - Estar inspirada en el misterio del día
   - Terminar con la fórmula trinitaria: "Por nuestro Señor Jesucristo..."
   - Ser breve (40-60 palabras)
   - Usar lenguaje litúrgico solemne

3. FORMATO EXACTO:
---COLECTA---
[texto de la oración]
Por nuestro Señor Jesucristo, tu Hijo, que vive y reina contigo en la unidad del Espíritu Santo y es Dios por los siglos de los siglos.

---OFRENDAS---
[texto de la oración]
Por Jesucristo nuestro Señor.

---POSTCOMUNION---
[texto de la oración]
Por Jesucristo nuestro Señor.

**GENERA LAS 3 ORACIONES CON LOS SEPARADORES EXACTOS:**
`;

    try {
        const response = await generateLiturgy(prompt);

        // Parse the response
        const collectMatch = response.match(/---COLECTA---([\s\S]*?)---OFRENDAS---/);
        const offeringsMatch = response.match(/---OFRENDAS---([\s\S]*?)---POSTCOMUNION---/);
        const postCommunionMatch = response.match(/---POSTCOMUNION---([\s\S]*?)$/);

        return {
            collect: collectMatch ? collectMatch[1].trim() : getDefaultCollect(feastLabel),
            offerings: offeringsMatch ? offeringsMatch[1].trim() : getDefaultOfferings(),
            postCommunion: postCommunionMatch ? postCommunionMatch[1].trim() : getDefaultPostCommunion()
        };
    } catch (error) {
        console.error('Error generating Proper Prayers:', error);
        return {
            collect: getDefaultCollect(feastLabel),
            offerings: getDefaultOfferings(),
            postCommunion: getDefaultPostCommunion()
        };
    }
};

/**
 * Generate Antiphons from the Gradual
 * @param {string} feastLabel - Name of the feast
 * @param {string} gospel - Gospel text
 * @returns {Promise<Object>} - Entrance and Communion Antiphons
 */
export const generateAntiphons = async (feastLabel, gospel) => {
    const { generateLiturgy } = await import('./gemini.js');

    const prompt = `
Eres un liturgista católico experto. Genera las ANTÍFONAS del día según el Gradual Romano.

**Celebración:** ${feastLabel}
**Evangelio:** ${gospel?.substring(0, 400) || 'No disponible'}

**INSTRUCCIONES:**
1. Genera 2 antífonas breves:
   - ANTÍFONA DE ENTRADA (para la procesión inicial)
   - ANTÍFONA DE COMUNIÓN (durante la comunión)

2. Cada antífona debe:
   - Ser un verso bíblico relacionado con el día
   - Máximo 2 líneas
   - Incluir la referencia bíblica al final (ej: "Sal 28, 3")
   - Estar inspirada en el evangelio o las lecturas

3. FORMATO EXACTO:
---ENTRADA---
[texto de la antífona]
([Referencia bíblica])

---COMUNION---
[texto de la antífona]
([Referencia bíblica])

**GENERA LAS 2 ANTÍFONAS CON LOS SEPARADORES EXACTOS:**
`;

    try {
        const response = await generateLiturgy(prompt);

        // Parse the response
        const entranceMatch = response.match(/---ENTRADA---([\s\S]*?)---COMUNION---/);
        const communionMatch = response.match(/---COMUNION---([\s\S]*?)$/);

        return {
            entrance: entranceMatch ? entranceMatch[1].trim() : getDefaultEntranceAntiphon(),
            communion: communionMatch ? communionMatch[1].trim() : getDefaultCommunionAntiphon()
        };
    } catch (error) {
        console.error('Error generating Antiphons:', error);
        return {
            entrance: getDefaultEntranceAntiphon(),
            communion: getDefaultCommunionAntiphon()
        };
    }
};

// Default prayers fallbacks
const getDefaultCollect = (feastLabel) => {
    return `Oh Dios, que en la festividad de ${feastLabel} manifiestas tu gloria, concede a tu pueblo la gracia de celebrar dignamente este santo misterio.

Por nuestro Señor Jesucristo, tu Hijo, que vive y reina contigo en la unidad del Espíritu Santo y es Dios por los siglos de los siglos.`;
};

const getDefaultOfferings = () => {
    return `Acepta, Señor, las ofrendas de tu Iglesia, y concede que, alimentados con el Cuerpo y la Sangre de tu Hijo, participemos de su vida divina.

Por Jesucristo nuestro Señor.`;
};

const getDefaultPostCommunion = () => {
    return `Alimentados con el pan del cielo, te pedimos, Señor, que este sacramento, que hemos recibido con fe, sea medicina de nuestras almas.

Por Jesucristo nuestro Señor.`;
};

const getDefaultEntranceAntiphon = () => {
    return `Cantad al Señor un cántico nuevo, porque ha hecho maravillas.\n(Sal 97, 1)`;
};

const getDefaultCommunionAntiphon = () => {
    return `Gustad y ved qué bueno es el Señor; dichoso el que se acoge a él.\n(Sal 33, 9)`;
};
