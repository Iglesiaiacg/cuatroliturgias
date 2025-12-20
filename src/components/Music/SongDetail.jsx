import { useState, useMemo } from 'react';

// Simple Transpose Logic
const SCALES = {
    sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

const transposeChord = (chord, semi) => {
    // Basic implementation handling major/minor
    let root = chord.replace(/m|maj|dim|aug|7|sus|add|9/g, '');
    let suffix = chord.substring(root.length);

    // Find index
    let scale = SCALES.sharp;
    let idx = scale.indexOf(root);
    if (idx === -1) {
        scale = SCALES.flat;
        idx = scale.indexOf(root);
    }

    if (idx === -1) return chord; // Unknown

    let newIdx = (idx + semi) % 12;
    if (newIdx < 0) newIdx += 12;

    return scale[newIdx] + suffix;
};

export default function SongDetail({ song, onClose }) {
    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(18); // Default 18px
    const [showChords, setShowChords] = useState(true);
    const [autoScroll, setAutoScroll] = useState(false);

    // Process Lyrics
    const content = useMemo(() => {
        // Regex to find chords [C#]
        const lines = song.lyrics.split('\n');
        return lines.map((line, i) => {
            // Split by chords
            const parts = line.split(/(\[.*?\])/g);
            return (
                <div key={i} className="min-h-[1.5em] my-1 leading-relaxed">
                    {parts.map((part, j) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                            // It's a chord
                            if (!showChords) return null; // Hide if toggled off

                            const rawChord = part.slice(1, -1);
                            const transposedChord = transpose === 0 ? rawChord : transposeChord(rawChord, transpose);

                            return (
                                <span key={j} className="text-red-600 font-bold mx-1 select-none" style={{ fontSize: '0.9em' }}>
                                    {transposedChord}
                                </span>
                            );
                        } else {
                            // It's lyrics
                            return <span key={j}>{part}</span>;
                        }
                    })}
                </div>
            );
        });
    }, [song.lyrics, transpose, showChords]);

    // Auto-scroll Effect
    // useEffect(() => {
    //     let interval;
    //     if (autoScroll) {
    //         interval = setInterval(() => {
    //             window.scrollBy(0, 1);
    //         }, 50); // Speed control could be added
    //     }
    //     return () => clearInterval(interval);
    // }, [autoScroll]);

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col animate-fade-in">
            {/* Toolbar (Atril Controls) */}
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg shrink-0">
                <button onClick={onClose} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="hidden sm:inline">Volver</span>
                </button>

                <div className="flex items-center gap-6">
                    {/* Transpose */}
                    <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                        <button onClick={() => setTranspose(t => t - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded">-</button>
                        <span className="w-8 text-center font-mono font-bold">{transpose > 0 ? `+${transpose}` : transpose}</span>
                        <button onClick={() => setTranspose(t => t + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded">+</button>
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                        <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-xs">A-</button>
                        <span className="w-8 text-center font-mono font-bold text-xs">{fontSize}</span>
                        <button onClick={() => setFontSize(s => Math.min(60, s + 2))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-lg">A+</button>
                    </div>

                    {/* Chords Toggle */}
                    <button
                        onClick={() => setShowChords(!showChords)}
                        className={`p-2 rounded-lg border font-bold text-sm ${showChords ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-500 border-gray-300'}`}
                    >
                        {showChords ? '# Acordes' : 'T Texto'}
                    </button>

                    {/* Print Button */}
                    <button
                        onClick={() => window.print()}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        title="Imprimir"
                    >
                        <span className="material-symbols-outlined">print</span>
                    </button>
                </div>
            </div>

            {/* Song Content */}
            <div className="flex-1 overflow-y-auto bg-paper-pattern p-8 sm:p-12 text-center" style={{ fontSize: `${fontSize}px` }}>
                <h1 className="text-3xl font-display font-bold mb-2">{song.title}</h1>
                <p className="text-sm text-gray-400 mb-8 italic print:hidden">Tono Original: {song.key} {transpose !== 0 && `(Transportado: ${transpose})`}</p>
                {/* Print only info */}
                <p className="hidden print:block text-xs text-gray-500 mb-8">Cuatro Liturgias - Cantoral</p>

                <div className="font-serif text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-w-3xl mx-auto pb-40 print:pb-0 text-left md:text-center inline-block">
                    {content}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .fixed { position: static !important; overflow: visible !important; }
                    button, .material-symbols-outlined { display: none !important; }
                    /* Hide everything else via global css or specific scopes if needed, but since this is a modal overlay: */
                    body > *:not(#root) { display: none; }
                    /* We rely on the fact effectively everything is hidden by this component's z-index and background,
                       but for print we need to be careful. Ideally we hide siblings. */
                     /* Quick fix for print visibility of just this content */
                     @page { margin: 2cm; }
                     body { background: white; color: black; }
                     .bg-paper-pattern { background: none; }
                }
            `}</style>
        </div>
    );
}
