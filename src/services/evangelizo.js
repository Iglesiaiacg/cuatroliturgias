/**
 * Evangelizo API Service
 * Fetches official Catholic liturgical readings from evangelizo.org
 * 
 * API Documentation: http://feed.evangelizo.org/v2/reader.php
 * 
 * Parameters:
 * - date: YYYYMMDD format
 * - type: 'all' for all readings
 * - lang: 'SP' for Spanish (Roman Calendar)
 */

const EVANGELIZO_ENDPOINT = 'https://feed.evangelizo.org/v2/reader.php';

/**
 * Fetch liturgical readings for a specific date
 * @param {Date} date - The date to fetch readings for
 * @returns {Promise<Object>} - Parsed readings object
 */
export const fetchEvangelizoReadings = async (date) => {
    try {
        // Format date as YYYYMMDD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        // Build URL
        const url = `${EVANGELIZO_ENDPOINT}?date=${dateStr}&type=all&lang=SP`;

        console.log(`📡 Fetching readings from Evangelizo: ${dateStr}`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Evangelizo API error: ${response.status}`);
        }

        const text = await response.text();

        // Parse the response (it's plain text with sections)
        const readings = parseEvangelizoResponse(text);

        console.log(`✅ Successfully fetched readings from Evangelizo`);

        return readings;
    } catch (error) {
        console.error('❌ Evangelizo API Error:', error);
        throw error;
    }
};

/**
 * Parse Evangelizo API response into structured format
 * @param {string} text - Raw text response
 * @returns {Object} - Structured readings
 */
const parseEvangelizoResponse = (text) => {
    console.log('🔍 Parsing Evangelizo response (Sequential Mode)...');

    const readings = {
        primera_lectura: null,
        salmo: null,
        segunda_lectura: null,
        evangelio: null
    };

    let remainingText = text;

    // 1. EXTRACT PRIMERA LECTURA
    // Look for generic book header
    const primeraMatch = remainingText.match(/(Libro de [^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*?)(?=Salmo|Libro de los Hechos|Lectura de la carta|Evangelio según|$)/i);
    if (primeraMatch) {
        readings.primera_lectura = cleanReadingText(primeraMatch[1]);
        console.log('   ✅ Found primera_lectura');

        // Advance cursor: remove everything up to end of this match
        const splitIndex = remainingText.indexOf(primeraMatch[0]) + primeraMatch[0].length;
        remainingText = remainingText.substring(splitIndex);
    }

    // 2. EXTRACT SALMO
    // Look for "Salmo" pattern in what's left
    const salmoMatch = remainingText.match(/(Salmo[^<]*<[^>]+>[\s\S]*?)(?=Libro de|Lectura de|Segunda lectura|Carta|Evangelio según|$)/i);
    if (salmoMatch) {
        readings.salmo = cleanReadingText(salmoMatch[1]);
        console.log('   ✅ Found salmo');

        // Advance cursor
        const splitIndex = remainingText.indexOf(salmoMatch[0]) + salmoMatch[0].length;
        remainingText = remainingText.substring(splitIndex);
    }

    // 3. EXTRACT SEGUNDA LECTURA
    // Now look for the next reading in the remaining text.
    // It could be 'Carta...', 'Libro de...' (Apocalypse), 'Lectura of...'
    // BUT since we already consumed First Reading and Psalm, the next "Libro de" HAS to be Second Reading.

    // Check if we are already at Gospel (Weekdays often have no 2nd reading)
    const evangelioCheck = remainingText.match(/^\s*(<[^>]+>)*\s*Evangelio según/i);

    if (!evangelioCheck) {
        const segundaMatch = remainingText.match(/((?:Carta |Libro |Lectura |Hechos )[^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*?)(?=Evangelio según|Aclamación|$)/i);
        if (segundaMatch) {
            readings.segunda_lectura = cleanReadingText(segundaMatch[1]);
            console.log('   ✅ Found segunda_lectura');

            // Advance cursor
            const splitIndex = remainingText.indexOf(segundaMatch[0]) + segundaMatch[0].length;
            remainingText = remainingText.substring(splitIndex);
        } else {
            console.log('   ℹ️  No segunda_lectura found (or regex failed)');
        }
    }

    // 4. EXTRACT EVANGELIO
    const evangelioMatch = remainingText.match(/(Evangelio según[^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*$)/i);
    if (evangelioMatch) {
        readings.evangelio = cleanReadingText(evangelioMatch[1]);
        console.log('   ✅ Found evangelio');
    }

    return readings;
};

/**
 * Clean and format reading text
 * @param {string} text - Raw text
 * @returns {string} - Cleaned text
 */
const cleanReadingText = (text) => {
    let clean = text
        // Remove HTML tags
        .replace(/<[^>]+>/g, '')
        // Convert HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // Remove liturgical headers if present at START
    const headersToRemove = [
        'Primera Lectura', '1ª Lectura',
        'Segunda Lectura', '2ª Lectura',
        'Salmo Responsorial', 'Salmo',
        'Evangelio', 'Santo Evangelio',
        'Lectura del Santo Evangelio'
    ];

    // Check if starts with header + optional colon/line break
    for (const header of headersToRemove) {
        const regex = new RegExp(`^${header}[:\\.]?\\s*`, 'i');
        if (clean.match(regex)) {
            // Be careful not to strip "Salmo 23" -> "23".
            // Only strip if it's acting as a label.
            // But "Salmo Responsorial" is safe to strip.
            // "Primera Lectura" is safe.

            if (header.startsWith('Salmo') && clean.match(/^Salmo \d/i)) {
                // It's likely "Salmo 23...", keep it for citation extraction
                continue;
            }
            clean = clean.replace(regex, '').trim();
        }
    }

    return clean;
};

/**
 * Extract biblical citation from reading text
 * @param {string} text - Reading text with citation
 * @returns {Object} - {citation: string, cleanText: string}
 */
export const extractCitation = (text) => {
    if (!text) return { citation: '', cleanText: '' };

    // Patterns for citations
    // Examples: "Libro de Isaías 49,1-4.6-7."
    //           "Libro de los Hechos de los Apóstoles 10,34-38."
    //           "Evangelio según San Mateo 3,13-17."
    //           "Salmo 29(28),1a.2.3ac-4.3b.9b-10."

    const patterns = [
        /^(Libro de.*?\d+[,\d\.\-ab]*)/i,
        /^(Evangelio según.*?\d+[,\d\.\-ab]*)/i,
        /^(Salmo \d+[^\n]*)/i,
        /^(Lectura de.*?\d+[,\d\.\-ab]*)/i,
        /^(Carta .*?\d+[,\d\.\-ab]*)/i,
        /^(Libro de los Hechos.*?\d+[,\d\.\-ab]*)/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const citation = match[1].trim();
            const cleanText = text.substring(match[0].length).trim();
            return { citation, cleanText };
        }
    }

    // If no citation found, return as is
    return { citation: '', cleanText: text };
};

/**
 * Format Evangelizo psalm into responsorial format with Salmista/Pueblo
 * @param {string} psalmText - Raw psalm text from Evangelizo
 * @returns {string} - Formatted psalm with labels
 */
export const formatResponsorialPsalm = (psalmText) => {
    if (!psalmText) return '';

    // Clean initial whitespace
    let lines = psalmText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // 1. EXTRACT ANTIPHON (RESPONSE)
    // Look for line starting with R. R/. or just the first logical line if it looks short
    let response = '';
    let startLineIndex = 0;

    // Try to find explicit Response marker
    const responseIndex = lines.findIndex(line => line.match(/^(R\.?\/|Respuesta|Antífona)[:\.]?\s*/i));

    if (responseIndex !== -1) {
        // Extract content after marker
        response = lines[responseIndex].replace(/^(R\.?\/|Respuesta|Antífona)[:\.]?\s*/i, '').trim();
        // Remove this line from verses
        lines.splice(responseIndex, 1);
    } else {
        // Fallback: Use the very first line if it looks like an antiphon (short, no numbers)
        // Only if it doesn't start with "Salmo"
        if (lines.length > 0 && !lines[0].match(/^Salmo/i)) {
            response = lines[0];
            lines.shift();
        } else {
            response = "R. (Antífon del día)";
        }
    }

    // Default clean (remove "Salmo X" header if present remaining)
    lines = lines.filter(line => !line.match(/^Salmo \d/i));

    let formatted = `**R/.** ${response}\n\n`;

    // 2. FORMAT VERSES
    // Group roughly by 2-3 lines to simulate stanzas
    let verseGroup = [];

    formatted += `**R/. ${response}**\n\n`;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip any leftover markers or the response itself if repeated exactly
        if (line.match(/^(R\.?\/|Respuesta)[:\.]?$/i)) continue;
        if (line.trim() === response.trim()) continue;

        // CRITICAL: Stop if we hit the Alleluia (it's the next section)
        if (line.match(/Aleluya/i)) break;

        verseGroup.push(line);

        // Logic: End group if line ends with period/colon, or max 3 lines
        const endsSentence = line.match(/[.:!?]$/);

        // Make groups slightly longer for better flow (3-4 lines)
        if ((verseGroup.length >= 2 && endsSentence) || verseGroup.length >= 4 || i === lines.length - 1) {
            if (verseGroup.length > 0) {
                formatted += `${verseGroup.join(' ')}\n\n`;
                formatted += `**R/.**\n\n`; // Just R/. to save space/repetitiveness, or full response? User wants clarity.
                // Re-adding response text makes it very clear for people.
                // formatted += `**R/.** ${response}\n\n`;
                verseGroup = [];
            }
        }
    }

    return formatted;
};

/**
 * Convert Evangelizo readings to our marker format
 * @param {Object} readings - Evangelizo readings object
 * @returns {string} - Markdown formatted text with markers
 */
export const formatEvangelizoReadings = (readings) => {
    console.log('📝 Formatting Evangelizo readings to markdown...');
    let markdown = '';

    if (readings.primera_lectura) {
        const { citation, cleanText } = extractCitation(readings.primera_lectura);
        const citationLine = citation ? `**${citation}**\n\n` : '';
        markdown += `[[LECTURA_1]]\n${citationLine}${cleanText.replace(/Bautizmo/g, 'Bautismo')}\n\n`;
    }

    if (readings.salmo) {
        const { citation, cleanText } = extractCitation(readings.salmo);
        const citationLine = citation ? `**${citation}**\n\n` : '';
        // Format psalm responsorially
        const formattedPsalm = formatResponsorialPsalm(cleanText);
        markdown += `[[SALMO]]\n${citationLine}${formattedPsalm}\n\n`;
    }

    if (readings.segunda_lectura) {
        const { citation, cleanText } = extractCitation(readings.segunda_lectura);
        const citationLine = citation ? `**${citation}**\n\n` : '';
        markdown += `[[LECTURA_2]]\n${citationLine}${cleanText.replace(/Bautizmo/g, 'Bautismo')}\n\n`;
    }

    if (readings.evangelio) {
        const { citation, cleanText } = extractCitation(readings.evangelio);
        const citationLine = citation ? `**${citation}**\n\n` : '';
        markdown += `[[EVANGELIO]]\n${citationLine}${cleanText.replace(/Bautizmo/g, 'Bautismo')}\n\n`;
    }

    console.log('✅ Formatted markdown length:', markdown.length);
    console.log('   Formatted markdown preview:', markdown.substring(0, 300));

    return markdown;
};

/**
 * Extract evangelist name from Gospel citation
 * @param {string} citation - Gospel citation (e.g., "Evangelio según San Mateo 3,13-17")
 * @returns {string} - Evangelist name or default
 */
export const extractEvangelist = (citation) => {
    if (!citation) return 'Mateo';

    const match = citation.match(/(?:según|de)\s+(?:san|San)\s+(\w+)/i);
    return match ? match[1] : 'Mateo';
};
