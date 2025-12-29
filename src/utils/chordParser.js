/**
 * Parses text where chords might be placed above lyrics (common in web tabs)
 * and converts them to the internal format: [C] Lyrics
 */
export function parseChordsFromText(input) {
    if (!input) return '';

    const lines = input.split('\n');
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1] || '';

        // Heuristic: Check if current line looks like a "chord line"
        if (isChordLine(currentLine) && !isChordLine(nextLine) && nextLine.trim().length > 0) {
            // Merge this line into the next line
            result.push(mergeChordsIntoLyrics(currentLine, nextLine));
            i++; // Skip next line as we consumed it
        } else {
            // If it's just chords but no lyrics below, wrap them in brackets anyway
            if (isChordLine(currentLine)) {
                result.push(formatInlineChords(currentLine));
            } else {
                result.push(currentLine);
            }
        }
    }

    return result.join('\n');
}

function isChordLine(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    // Regex for common chords: A-G, Do-Si, optional #/b, optional m/min/maj/dim/sus/add/7/9
    const chordRegex = /^([A-G]|Do|Re|Mi|Fa|Sol|La|Si)[b#]?(m|min|maj|dim|aug|sus|add|[0-9])*(\/[A-G]|\/[D-S][a-z]*)?[b#]?$/i;

    const parts = trimmed.split(/\s+/);
    // If > 70% of parts look like chords, it's a chord line
    const chordCount = parts.filter(p => chordRegex.test(p)).length;
    return (chordCount / parts.length) > 0.7;
}

function mergeChordsIntoLyrics(chordLine, lyricLine) {
    // This is tricky because we need to preserve position.
    let merged = lyricLine;
    let offset = 0; // Because inserting brackets shifts the string indices

    // Find all chords with their positions
    const chords = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(chordLine)) !== null) {
        chords.push({ text: match[0], index: match.index });
    }

    // Sort by index just in case, though regex gives them in order
    chords.sort((a, b) => a.index - b.index);

    for (const chord of chords) {
        const insertAt = chord.index + offset;
        const chordStr = `[${chord.text}]`;

        // Pad lyricLine if short
        if (insertAt > merged.length) {
            merged = merged.padEnd(insertAt, ' ');
        }

        const before = merged.slice(0, insertAt);
        const after = merged.slice(insertAt);

        merged = before + chordStr + after;
        offset += chordStr.length;
    }

    return merged;
}

function formatInlineChords(line) {
    // Turn "C G Am F" into "[C] [G] [Am] [F]"
    return line.replace(/(\S+)/g, '[$1]');
}

// --- TRANSPOSITION & NOTATION UTILS ---

const NOTES_AMERICAN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_LATIN = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const FLATS = { 'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#', 'Cb': 'B' };

// Map Latin inputs to American for internal processing if needed
const LATIN_TO_AMERICAN = {
    'Do': 'C', 'Re': 'D', 'Mi': 'E', 'Fa': 'F', 'Sol': 'G', 'La': 'A', 'Si': 'B'
};

/**
 * Transposes chords in a text block AND formats them according to the selected notation system.
 * @param {string} text - The lyrics text with [Chords]
 * @param {number} semitones - Number of semitones to transpose
 * @param {string} system - 'american' | 'latin'
 */
export function transposeAndFormat(text, semitones, system = 'american') {
    if (!text) return '';

    return text.replace(/\[(.*?)\]/g, (match, chord) => {
        // Remove brackets for processing
        const inner = chord;

        // Handle slash chords like C/G
        if (inner.includes('/')) {
            const parts = inner.split('/');
            const root = transposeNote(parts[0], semitones, system);
            const bass = transposeNote(parts[1], semitones, system);
            return `[${root}/${bass}]`;
        } else {
            return `[${transposeNote(inner, semitones, system)}]`;
        }
    });
}

/**
 * Helper to transpose a single note
 */
function transposeNote(chordStr, semitones, system) {
    // 1. Parse Root + Suffix
    // Regex matches Root (A-G or Do-Si) + Accidental (#/b) + The rest
    const match = chordStr.match(/^([A-G][b#]?|Do[b#]?|Re[b#]?|Mi[b#]?|Fa[b#]?|Sol[b#]?|La[b#]?|Si[b#]?)(.*)$/i);
    if (!match) return chordStr;

    let root = match[1];
    const suffix = match[2];

    // 2. Normalize to American Index (0-11)
    let index = -1;

    // Check if it's Latin
    const latinRoot = root.replace(/[b#]/, ''); // Just the name without accidental
    if (LATIN_TO_AMERICAN[latinRoot] || LATIN_TO_AMERICAN[latinRoot.charAt(0).toUpperCase() + latinRoot.slice(1)]) {
        // Convert Latin input to American for calculation
        // e.g. "Sol#" -> "G#"
        const normalizedLatin = latinRoot.charAt(0).toUpperCase() + latinRoot.slice(1);
        let americanBase = LATIN_TO_AMERICAN[normalizedLatin];

        // Add accidental back
        if (root.includes('#')) americanBase += '#';
        if (root.includes('b')) {
            // Convert flat to sharp for internal index
            if (americanBase === 'B') americanBase = 'A#'; // Simple hack, better to use map
            // Actually let's just find index in NOTES_AMERICAN
        }

        // A simpler way: Map all Latin variations to indices directly?
        // Let's reuse american logic by converting first.

        // Manual Map for this quick implementation:
        if (root.toLowerCase().startsWith('do')) index = 0;
        if (root.toLowerCase().startsWith('re')) index = 2;
        if (root.toLowerCase().startsWith('mi')) index = 4;
        if (root.toLowerCase().startsWith('fa')) index = 5;
        if (root.toLowerCase().startsWith('sol')) index = 7;
        if (root.toLowerCase().startsWith('la')) index = 9;
        if (root.toLowerCase().startsWith('si')) index = 11;

        if (root.includes('#')) index += 1;
        if (root.includes('b')) index -= 1;

    } else {
        // American Input
        // Normalize flats
        if (FLATS[root]) root = FLATS[root];
        index = NOTES_AMERICAN.indexOf(root);
    }

    if (index === -1) return chordStr; // Unknown

    // 3. Apply Transposition
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // 4. Output Note Name based on System
    let newRoot = (system === 'latin') ? NOTES_LATIN[newIndex] : NOTES_AMERICAN[newIndex];

    return newRoot + suffix;
}

