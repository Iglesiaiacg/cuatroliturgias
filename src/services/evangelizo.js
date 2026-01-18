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
    console.log('🔍 Parsing Evangelizo response...');
    console.log('   Raw text length:', text.length);
    console.log('   Raw text preview:', text.substring(0, 300));

    const readings = {
        primera_lectura: null,
        salmo: null,
        segunda_lectura: null,
        evangelio: null
    };

    // The Evangelizo API returns everything in one big HTML block
    // We need to extract each section by finding its header and capturing until the next header or end

    // Extract Primera Lectura - look for biblical book name pattern
    const primeraMatch = text.match(/(Libro de [^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*?)(?=Salmo|Libro de los Hechos|Lectura de la carta|Evangelio según|$)/i);
    if (primeraMatch) {
        readings.primera_lectura = cleanReadingText(primeraMatch[1]);
        console.log('   ✅ Found primera_lectura');
    }

    // Extract Salmo - look for "Salmo" pattern
    const salmoMatch = text.match(/(Salmo[^<]*<[^>]+>[\s\S]*?)(?=Libro de los Hechos|Lectura de la carta|Segunda lectura|Evangelio según|$)/i);
    if (salmoMatch) {
        readings.salmo = cleanReadingText(salmoMatch[1]);
        console.log('   ✅ Found salmo');
    }

    // Extract Segunda Lectura - look for Acts, Letters, or any other second reading pattern
    // This appears between the Psalm and the Gospel
    // Common patterns: "Libro de los Hechos...", "Lectura de la carta...", "Lectura de la primera/segunda carta..."
    const segundaMatch = text.match(/((?:Libro de los Hechos|Lectura de la (?:primera |segunda )?carta)[^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*?)(?=Evangelio según|$)/i);
    if (segundaMatch) {
        readings.segunda_lectura = cleanReadingText(segundaMatch[1]);
        console.log('   ✅ Found segunda_lectura');
    } else {
        console.log('   ℹ️  No segunda_lectura found (weekday or special mass)');
    }

    // Extract Evangelio - look for "Evangelio según" pattern
    const evangelioMatch = text.match(/(Evangelio según[^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*$)/i);
    if (evangelioMatch) {
        readings.evangelio = cleanReadingText(evangelioMatch[1]);
        console.log('   ✅ Found evangelio');
    }

    console.log('📋 Parsed readings:', {
        primera_lectura: readings.primera_lectura ? readings.primera_lectura.substring(0, 100) + '...' : 'NULL',
        salmo: readings.salmo ? readings.salmo.substring(0, 100) + '...' : 'NULL',
        segunda_lectura: readings.segunda_lectura ? readings.segunda_lectura.substring(0, 100) + '...' : 'NULL',
        evangelio: readings.evangelio ? readings.evangelio.substring(0, 100) + '...' : 'NULL'
    });

    return readings;
};

/**
 * Clean and format reading text
 * @param {string} text - Raw text
 * @returns {string} - Cleaned text
 */
const cleanReadingText = (text) => {
    return text
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
};

/**
 * Extract biblical citation from reading text
 * @param {string} text - Reading text with citation
 * @returns {Object} - {citation: string, cleanText: string}
 */
const extractCitation = (text) => {
    if (!text) return { citation: '', cleanText: '' };

    // Patterns for citations
    // Examples: "Libro de Isaías 49,1-4.6-7."
    //           "Libro de los Hechos de los Apóstoles 10,34-38."
    //           "Evangelio según San Mateo 3,13-17."
    //           "Salmo 29(28),1a.2.3ac-4.3b.9b-10."

    const patterns = [
        /^(Libro de[^\.]+\d+[,\d\.\-ab]+)/i,
        /^(Evangelio según[^\.]+\d+[,\d\.\-]+)/i,
        /^(Salmo \d+[^\n]*)/i,
        /^(Lectura de[^\.]+\d+[,\d\.\-]+)/i
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

    // Use standard liturgical response
    const response = 'Te alabamos, Señor.';

    // Split into lines and clean
    const lines = psalmText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    let formatted = `**R/.** ${response}\n\n`;

    // Group verses - typically 2-3 lines per group
    let verseGroup = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip lines that look like headers or responses
        if (line.match(/^R[\\/\.]?/i) || line.match(/^Salmo/i)) {
            continue;
        }

        // Add to current group
        verseGroup.push(line);

        // Every 2-3 lines, or at the end, add the group with response
        if (verseGroup.length >= 2 || i === lines.length - 1) {
            if (verseGroup.length > 0) {
                formatted += `**Salmista:** ${verseGroup.join(' ')}\n\n`;
                formatted += `**Pueblo:** R/.\n\n`;
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
