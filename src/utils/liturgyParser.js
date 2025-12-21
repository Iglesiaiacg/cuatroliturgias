
/**
 * Extracts specific sections from the Liturgy HTML content.
 * Assumes standard structures like <h2>Title</h2><p>Content</p>
 */
export const extractSection = (htmlContent, sectionKey) => {
    if (!htmlContent) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Map internal keys to likely headers in the generated content
    // The prompts usually generate headers like "Primera Lectura", "Salmo Responsorial", etc.
    const keyMap = {
        'moncion_entrada': ['Monición de Entrada', 'Ritos Iniciales'],
        'primera_lectura': ['Primera Lectura', 'Lectura del Profeta', 'Lectura del libro'],
        'salmo': ['Salmo Responsorial', 'Salmo'],
        'segunda_lectura': ['Segunda Lectura', 'Lectura de la carta', 'Lectura del libro'],
        'evangelio': ['Evangelio', 'Santo Evangelio'],
        'oracion_fieles': ['Oración de los Fieles', 'Peticiones'],
        'cantos': ['Cantos', 'Sugerencias Musicales', 'Música'] // Special case for musicians
    };

    const headers = Array.from(doc.querySelectorAll('h1, h2, h3, h4, strong'));
    const targetHeaders = keyMap[sectionKey] || [];

    for (const h of headers) {
        const text = h.textContent.trim().toLowerCase();
        if (targetHeaders.some(target => text.includes(target.toLowerCase()))) {
            // Found the header, now extract content until next header
            let content = [];
            let next = h.nextElementSibling;

            while (next && !['H1', 'H2', 'H3', 'H4'].includes(next.tagName)) {
                content.push(next.textContent.trim());
                next = next.nextElementSibling;
            }

            return content.filter(c => c).join('\n\n');
        }
    }

    return null;
};
