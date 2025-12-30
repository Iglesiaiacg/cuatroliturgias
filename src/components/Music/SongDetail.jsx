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

    // Rehearsal & Auto-Scroll State
    const [isRehearsal, setIsRehearsal] = useState(false);
    const [isAutoScroll, setIsAutoScroll] = useState(false);
    const scrollRef = useRef(null);
    const scrollIntervalRef = useRef(null);

    const videoId = useMemo(() => {
        if (!song.youtubeUrl) return null;
        try {
            const url = new URL(song.youtubeUrl);
            if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
            if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
        } catch (e) { return null; }
        return null;
    }, [song.youtubeUrl]);

    // Auto Scroll Logic
    useEffect(() => {
        if (isAutoScroll && scrollRef.current) {
            const speed = 1; // Pixels per tick
            scrollIntervalRef.current = setInterval(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop += speed;
                    // Stop if reached bottom
                    if (scrollRef.current.scrollTop + scrollRef.current.clientHeight >= scrollRef.current.scrollHeight) {
                        setIsAutoScroll(false);
                    }
                }
            }, 50); // Adjust for speed
        } else {
            clearInterval(scrollIntervalRef.current);
        }
        return () => clearInterval(scrollIntervalRef.current);
    }, [isAutoScroll]);

    // Cleanup scroll on unmount
    useEffect(() => () => clearInterval(scrollIntervalRef.current), []);

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

    // Process Lyrics
    const content = useMemo(() => {
        const lines = song.lyrics.split('\n');

        return lines.map((line, i) => {
            const rawParts = line.split(/(\[.*?\])/g);
            const segments = [];
            let currentChord = null;

            rawParts.forEach(part => {
                if (part.startsWith('[') && part.endsWith(']')) {
                    if (currentChord) {
                        // Double chord sequence (render previous chord with space)
                        segments.push({ chord: currentChord, text: '\u00A0' });
                    }
                    currentChord = part;
                } else {
                    // Filter empty parts unless they hold a chord place
                    if (part === '' && !currentChord) return;
                    segments.push({ chord: currentChord, text: part });
                    currentChord = null;
                }
            });

            if (currentChord) {
                segments.push({ chord: currentChord, text: '' });
            }

            // If line is empty string in source, render a break
            if (segments.length === 0) return <div key={i} className="h-4"></div>;

            return (
                <div key={i} className="flex flex-wrap items-end min-h-[3.5em] my-1 gap-y-2">
                    {segments.map((seg, j) => {
                        const displayChord = seg.chord
                            ? transposeAndFormat(seg.chord, transpose, notationSystem).replace(/[\[\]]/g, '')
                            : null;

                        return (
                            <div key={j} className="flex flex-col justify-end group min-w-[1ch]">
                                {/* Chord Line - Absolute positioning relative to text sometimes better, but block is safer for spacing */}
                                {/* If we want the word NOT to break, we shouldn't use margins. */}
                                {/* If chord is wider than text, the text WILL have a gap. This is standard behavior. */}

                                {showChords && (
                                    <div
                                        className={`font-bold text-base mb-1 whitespace-pre select-none leading-none ${displayChord ? 'text-primary dark:text-primary-light' : 'invisible h-5'}`}
                                        style={{ fontFamily: 'monospace' }} // Monospace for chords helps alignment
                                    >
                                        {displayChord || ' '}
                                    </div>
                                )}
                                {/* Lyrics Line */}
                                <div className="whitespace-pre text-gray-900 dark:text-gray-100 text-lg sm:text-xl leading-none font-medium font-sans">
                                    {seg.text || ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        });
    }, [song.lyrics, transpose, showChords, notationSystem]);

    // Audio File State
    const [audioUrl, setAudioUrl] = useState(null);
    const audioRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke previous URL if exists
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setIsPlaying(true); // Start playing immediately
            if (audioRef.current) {
                audioRef.current.load(); // Load the new audio
                audioRef.current.play();
            }
        }
    };

    // Cleanup audio url
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        }
    }, [audioUrl]);

    const handleBpmChange = (value) => {
        const val = Math.max(40, Math.min(240, Number(value)));
        setBpm(val);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            updateSong(song.id, { bpm: val });
        }, 1000);
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${song.title}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteSong(song.id);
                onClose();
            } catch (error) {
                console.error("Error deleting song:", error);
                alert("Error al eliminar el canto: " + error.message);
            }
        }
    };

    const canDelete = (checkPermission && checkPermission('manage_music')) || userRole === 'admin';

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col animate-fade-in">
            {/* Toolbar (Simplified) */}
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 p-2 sm:p-4 flex flex-wrap items-center justify-between gap-2 shadow-lg shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="btn-ghost !p-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    {/* Add to Setlist - Compact */}
                    {onAddToSetlist && activeListName && (
                        <button onClick={onAddToSetlist} className="btn-secondary !py-1 !px-2 flex gap-1 items-center bg-green-50 text-green-700" title={`Añadir a ${activeListName}`}>
                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                        </button>
                    )}
                </div>

                {/* Center Controls (Playback & Tools) */}
                <div className="flex items-center gap-4">
                    {/* Audio/Metronome Control */}
                    <div className="flex items-center bg-white dark:bg-white/5 rounded-full p-1 shadow-sm border border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => {
                                setIsPlaying(!isPlaying);
                                if (audioRef.current) {
                                    isPlaying ? audioRef.current.pause() : audioRef.current.play();
                                }
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-primary text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>

                        {(isPlaying || isRehearsal) && (
                            <div className="flex items-center gap-2 px-2 animate-fade-in">
                                {/* BPM */}
                                <div className="flex flex-col items-center w-8">
                                    <input
                                        type="number"
                                        value={bpm}
                                        onChange={(e) => handleBpmChange(e.target.value)}
                                        className="w-full text-center bg-transparent font-mono font-bold text-xs outline-none"
                                    />
                                    <span className="text-[8px] text-gray-400">BPM</span>
                                </div>

                                {/* Auto Scroll */}
                                <button
                                    onClick={() => setIsAutoScroll(!isAutoScroll)}
                                    className={`p-1 rounded-full ${isAutoScroll ? 'text-blue-500 bg-blue-50' : 'text-gray-400'}`}
                                    title="Auto Scroll"
                                >
                                    <span className="material-symbols-outlined text-lg">swipe_up</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Visual Indicators (Beat) */}
                    {isPlaying && !audioUrl && (
                        <div className="flex gap-1">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${beat === i ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Controls (Appearance & File) */}
                <div className="flex items-center gap-2">
                    {/* Rehearsal Toggle (YouTube/MP3) */}
                    <div className="relative group">
                        <button className="btn-ghost !p-2 text-gray-500">
                            <span className="material-symbols-outlined">settings_suggest</span>
                        </button>
                        {/* Dropdown for Rehearsal Setup */}
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-xl rounded-xl p-3 w-48 hidden group-hover:block z-50">
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Ensayo</h4>

                            {/* YouTube Toggle */}
                            {videoId ? (
                                <button
                                    onClick={() => setIsRehearsal(!isRehearsal)}
                                    className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-sm ${isRehearsal ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">youtube_activity</span>
                                    {isRehearsal ? 'Ocultar Video' : 'Mostrar Video'}
                                </button>
                            ) : (
                                <span className="text-xs text-gray-400 px-2 block mb-1">Sin video (editar para añadir)</span>
                            )}

                            {/* Local Audio Input */}
                            <label className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${audioUrl ? 'text-green-600' : ''}`}>
                                <span className="material-symbols-outlined text-lg">audio_file</span>
                                {audioUrl ? 'Cambiar MP3' : 'Cargar MP3'}
                                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Transpose & Chords */}
                    <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                        <button onClick={() => setTranspose(t => t - 1)} className="hover:bg-white dark:hover:bg-white/10 rounded px-2 font-bold">-</button>
                        <span className={`w-6 text-center text-sm font-bold ${transpose !== 0 ? 'text-primary' : ''}`}>{transpose}</span>
                        <button onClick={() => setTranspose(t => t + 1)} className="hover:bg-white dark:hover:bg-white/10 rounded px-2 font-bold">+</button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={() => setShowChords(!showChords)} className={`px-2 rounded ${showChords ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            <span className="material-symbols-outlined text-lg">music_note</span>
                        </button>
                    </div>

                    {/* Actions */}
                    {canDelete && (
                        <button onClick={handleDelete} className="btn-ghost !p-2 text-red-400 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Audio Element Hidden */}
            {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}

            {/* Song Content Container with Side Panel for Video */}
            <div className="flex flex-1 overflow-hidden">
                {/* VIDEO PANEL (Visible on Desktop Split or Mobile Top) */}
                {isRehearsal && videoId && (
                    <div className="w-full lg:w-96 bg-black shrink-0 flex items-center justify-center relative lg:border-r border-gray-800">
                        {/* Close Rehearsal Mode button for mobile convenience */}
                        <div className="absolute top-2 right-2 z-10 lg:hidden">
                            <button onClick={() => setIsRehearsal(false)} className="bg-black/50 text-white rounded-full p-1"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            className="w-full h-full lg:h-64 aspect-video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* LYRICS SCROLL AREA */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto bg-paper-pattern p-4 sm:p-12 text-center relative scroll-smooth"
                    style={{ fontSize: `${fontSize}px` }}
                >
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

                    <div className="font-serif text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-w-3xl mx-auto pb-64 print:pb-0 text-left md:text-center inline-block">
                        {content}
                    </div>
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
