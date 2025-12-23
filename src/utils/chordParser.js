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
        // 1. Mostly short words (chords)
        // 2. Contains musical notes (A-G, #, b, m, 7, etc.)
        // 3. Lots of spaces
        if (isChordLine(currentLine) && !isChordLine(nextLine) && nextLine.trim().length > 0) {
            // Merge this line into the next line
            result.push(mergeChordsIntoLyrics(currentLine, nextLine));
            i++; // Skip next line as we consumed it
        } else {
            // Just a normal line (or lyrics without chords above, or just chords)
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

    // Regex for common chords: A-G, optional #/b, optional m/min/maj/dim/sus/add/7/9
    // This is loose to allow false positives rather than false negatives, relies on context
    const chordRegex = /^[A-G][b#]?(m|min|maj|dim|aug|sus|add|[0-9])*(\/[A-G][b#]?)?$/;

    const parts = trimmed.split(/\s+/);
    // If > 80% of parts look like chords, it's a chord line
    const chordCount = parts.filter(p => chordRegex.test(p)).length;
    return (chordCount / parts.length) > 0.6;
}

function mergeChordsIntoLyrics(chordLine, lyricLine) {
    // This is tricky because we need to preserve position.
    // We'll iterate through chordLine finding chords and inserting them into lyricLine at the same index

    let merged = lyricLine;
    let offset = 0; // Because inserting brackets shifts the string indices

    // Find all chords with their positions
    const chords = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(chordLine)) !== null) {
        chords.push({ text: match[0], index: match.index });
    }

    // Sort backwards so insertion doesn't mess up indices? 
    // Actually typically we read L->R. If we insert `[C]` at index 5, index 10 moves to 13.
    // So we need to track offset.

    for (const chord of chords) {
        const insertAt = chord.index + offset;
        const chordStr = `[${chord.text}]`;

        // Pad lyricLine if short
        if (insertAt > merged.length) {
            merged = merged.padEnd(insertAt, ' ');
        }

        // Insert
        // However, we want to respect word boundaries if possible? 
        // Usually chords are above the syllable.
        // Pure index insertion is the most standard approach for fixed-width to variable-width conversion.

        const before = merged.slice(0, insertAt);
        const after = merged.slice(insertAt);

        // Optimization: If `after` starts with a specific vowel/space, maybe check? 
        // For now, strict position preservation is best.

        merged = before + chordStr + after;
        offset += chordStr.length;
    }

    return merged;
}

function formatInlineChords(line) {
    // Turn "C G Am F" into "[C] [G] [Am] [F]"
    return line.replace(/(\S+)/g, '[$1]');
}

// --- TRANSPOSITION UTILS ---

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = { 'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };

export function transposeChords(text, semitones) {
    if (!text) return '';
    if (semitones === 0) return text;

    return text.replace(/\[(.*?)\]/g, (match, chord) => {
        // Handle complex chords like C/G or Asus4
        if (chord.includes('/')) {
            const parts = chord.split('/');
            return `[${transposeNote(parts[0], semitones)}/${transposeNote(parts[1], semitones)}]`;
        } else {
            return `[${transposeNote(chord, semitones)}]`;
        }
    });
}

function transposeNote(note, semitones) {
    // Extract root note (e.g., "C" from "Cmaj7")
    const match = note.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return note;

    let root = match[1];
    const suffix = match[2];

    // Normalize flats to sharps
    if (FLATS[root]) root = FLATS[root];

    let index = NOTES.indexOf(root);
    if (index === -1) return note; // Unknown note

    // Shift
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return NOTES[newIndex] + suffix;
}
