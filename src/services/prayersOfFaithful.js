/**
 * Generate contextual Alleluia verse based on the Gospel
 * @param {string} gospel - Gospel text from Evangelizo
 * @returns {Promise<string>} - Generated Alleluia verse
 */
export const generateAlleluiaVerse = async (gospel) => {
    const { generateLiturgy } = await import('./gemini.js');

    const prompt = `
Eres un liturgista católico experto. Genera SOLO el verso del Aleluya para la aclamación antes del Evangelio.

**Evangelio del día:**
${gospel || 'No disponible'}

**INSTRUCCIONES:**
1. Genera UN solo verso que resuma el mensaje principal del evangelio
2. Debe ser breve (máximo 2 líneas)
3. Usa lenguaje litúrgico solemne
4. NO incluyas "Aleluya" al inicio ni al final (eso ya está en la estructura)
5. Ejemplo de formato correcto:
   "Se abrieron los cielos y se oyó la voz del Padre: Este es mi Hijo amado, escuchadlo."

**GENERA SOLO EL VERSO, SIN "Aleluya" ni explicaciones:**
`;

    try {
        const verse = await generateLiturgy(prompt);
        return verse.trim();
    } catch (error) {
        console.error('Error generating Alleluia verse:', error);
        // Return default verse as fallback
        return "Proclama el reino de Dios y sana a los enfermos.";
    }
};

/**
 * Generate contextual Prayers of the Faithful based on readings
 * @param {Object} readings - Evangelizo readings object
 * @param {string} feastLabel - Name of the feast/celebration
 * @returns {Promise<string>} - Generated intercessions
 */
export const generatePrayersOfFaithful = async (readings, feastLabel) => {
    const { generateLiturgy } = await import('./gemini.js');

    const prompt = `
Eres un liturgista católico experto. Genera 5 peticiones para la Oración Universal (Oración de los Fieles) basadas en las lecturas del día.

**Contexto Litúrgico:**
Celebración: ${feastLabel}

**Evangelio del día:**
${readings.evangelio || 'No disponible'}

**Primera Lectura:**
${readings.primera_lectura || 'No disponible'}

**INSTRUCCIONES:**
1. Genera exactamente 5 peticiones en este orden:
   - Por la Iglesia
   - Por los gobernantes y el mundo
   - Por los necesitados
   - Por la comunidad local
   - Por los difuntos

2. Cada petición debe estar inspirada en los temas de las lecturas del día.

3. Formato EXACTO (copia este formato):

**Diácono/Lector:**

Por la santa Iglesia de Dios: [petición relacionada con las lecturas].

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestro Papa, nuestros obispos y todos los ministros del Evangelio: [petición relacionada con las lecturas].

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los gobernantes de las naciones: [petición relacionada con las lecturas].

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los enfermos, los que sufren y los marginados: [petición relacionada con las lecturas].

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestra comunidad: [petición relacionada con las lecturas].

**Pueblo:** Te rogamos, óyenos.

4. NO incluyas introducción ni conclusión, solo las 5 peticiones.
5. Usa un lenguaje litúrgico solemne pero accesible.
6. Conecta cada petición con un tema específico del evangelio o las lecturas.
`;

    try {
        const intercessions = await generateLiturgy(prompt);
        return intercessions;
    } catch (error) {
        console.error('Error generating Prayers of the Faithful:', error);
        // Return default generic prayers as fallback
        return `
**Diácono/Lector:**

Por la santa Iglesia de Dios: para que el Señor la proteja y la santifique.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestro Papa, nuestros obispos y todos los ministros del Evangelio: para que sean fieles dispensadores de los misterios de Dios.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los gobernantes de las naciones: para que busquen la justicia y la paz.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los enfermos, los que sufren y los marginados: para que experimenten el amor sanador de Cristo.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestra comunidad: para que crezcamos en santidad y en el amor mutuo.

**Pueblo:** Te rogamos, óyenos.
`;
    }
};
