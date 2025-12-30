import { useState, useMemo, useRef, useEffect } from 'react';
import { transposeAndFormat } from '../../utils/chordParser';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';

export default function SongDetail({ song, onClose, onAddToSetlist, activeListName }) {
    const { notationSystem, deleteSong, updateSong } = useMusic();
    const { userRole, checkPermission } = useAuth();

    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(18); // Default 18px
    const [showChords, setShowChords] = useState(true);

    // Metronome State
    const [bpm, setBpm] = useState(song.bpm || 100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [beat, setBeat] = useState(0); // For visual indicator
    const timerRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Persist BPM changes
    const handleBpmChange = (newBpm) => {
        const val = Math.max(40, Math.min(240, Number(newBpm)));
        setBpm(val);

        // Debounce save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            updateSong(song.id, { bpm: val });
        }, 1000);
    };

    // Metronome Logic
    useEffect(() => {
        if (isPlaying) {
            const interval = 60000 / bpm;
            timerRef.current = setInterval(() => {
                setBeat(b => (b + 1) % 4);
            }, interval);
        } else {
            clearInterval(timerRef.current);
            setBeat(0);
        }

        return () => clearInterval(timerRef.current);
    }, [isPlaying, bpm]);

    // Cleanup save timeout
    useEffect(() => () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }, []);

    // ... (Process Lyrics content logic remains safely below)

    // ... (handleDelete logic)

    const canDelete = (checkPermission && checkPermission('manage_music')) || userRole === 'admin';

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col animate-fade-in">
            {/* Toolbar (Atril Controls) */}
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 p-2 sm:p-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shadow-lg shrink-0 overflow-x-auto no-scrollbar">
                <button onClick={onClose} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white shrink-0">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="hidden sm:inline">Volver</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Add to Setlist Button */}
                    {onAddToSetlist && activeListName && (
                        <button
                            onClick={onAddToSetlist}
                            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title={`Añadir a lista: ${activeListName}`}
                        >
                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                            <span className="hidden sm:inline">Añadir a Lista</span>
                        </button>
                    )}

                    {/* METRONOME */}
                    <div className="flex items-center gap-1 bg-white dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isPlaying ? 'bg-primary text-white shadow-inner animate-pulse' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                            title={isPlaying ? "Detener" : "Iniciar Metrónomo"}
                        >
                            <span className="material-symbols-outlined">{isPlaying ? 'stop' : 'metronome'}</span>
                        </button>

                        {/* BPM Control */}
                        <div className="flex flex-col items-center w-12">
                            <input
                                type="number"
                                value={bpm}
                                onChange={(e) => handleBpmChange(e.target.value)}
                                className="w-full text-center bg-transparent font-mono font-bold text-xs outline-none appearance-none"
                                min="40" max="240"
                            />
                            <span className="text-[9px] text-gray-400 uppercase">BPM</span>
                        </div>

                        {/* Visual Beat Indicator */}
                        <div className="flex gap-0.5 px-1">
                            {[0, 1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-75 ${isPlaying && beat === i ? 'bg-primary scale-125' : 'bg-gray-200 dark:bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Transpose */}
                    <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                        <button
                            onClick={() => setTranspose(t => t - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded font-bold text-lg"
                        >-</button>
                        <span className="w-10 text-center font-mono font-bold text-primary">
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <button
                            onClick={() => setTranspose(t => t + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded font-bold text-lg"
                        >+</button>
                    </div>

                    {/* Font Size */}
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                        <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded text-xs px-1">A-</button>
                        <span className="w-8 text-center font-mono font-bold text-xs">{fontSize}</span>
                        <button onClick={() => setFontSize(s => Math.min(60, s + 2))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded text-lg px-1">A+</button>
                    </div>

                    {/* Chords Toggle */}
                    <button
                        onClick={() => setShowChords(!showChords)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold ${showChords ? 'bg-primary text-white border-primary shadow-sm' : 'bg-transparent text-gray-400 border-gray-200 dark:border-white/10'}`}
                        title={showChords ? "Ocultar Acordes" : "Mostrar Acordes"}
                    >
                        <span className="material-symbols-outlined">music_note</span>
                    </button>

                    {/* Delete Button */}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 transition-colors"
                            title="Eliminar Canto"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}

                    {/* Print Button */}
                    <button
                        onClick={() => window.print()}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        title="Imprimir"
                    >
                        <span className="material-symbols-outlined">print</span>
                    </button>
                </div>
            </div>

            {/* Song Content */}
            <div className="flex-1 overflow-y-auto bg-paper-pattern p-4 sm:p-12 text-center" style={{ fontSize: `${fontSize}px` }}>
                <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">{song.title}</h1>
                <p className="text-base text-gray-500 mb-8 italic print:hidden">
                    Clave: <span className="font-bold text-primary">{song.key}</span>
                    {transpose !== 0 && ` (Transportado)`}
                    <span className="ml-4 text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                        {notationSystem === 'latin' ? 'Do Re Mi' : 'C D E'}
                    </span>
                </p>
                {/* Print only info */}
                <p className="hidden print:block text-xs text-gray-600 mb-8">Cuatro Liturgias - Cantoral</p>

                <div className="font-serif text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-w-3xl mx-auto pb-40 print:pb-0 text-left md:text-center inline-block">
                    {content}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .fixed { position: static !important; overflow: visible !important; }
                    button, .material-symbols-outlined { display: none !important; }
                    body > *:not(#root) { display: none; }
                     @page { margin: 2cm; }
                     body { background: white; color: black; }
                     .bg-paper-pattern { background: none; }
                }
            `}</style>
        </div>,
        document.body
    );
}
