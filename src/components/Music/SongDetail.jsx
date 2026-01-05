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
                                        className={`font-bold text-base mb-1 whitespace-pre select-none leading-none font-mono ${displayChord ? 'text-primary dark:text-primary-light' : 'invisible h-5'}`}
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
            {/* TOOLBAR: Mobile Optimized */}
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg shrink-0 z-50">

                {/* Top Row (Mobile): Back + Playback + Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="btn-ghost !p-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        {onAddToSetlist && activeListName && (
                            <button onClick={onAddToSetlist} className="btn-secondary !py-1 !px-2 flex gap-1 items-center bg-green-50 text-green-700" title={`Añadir a ${activeListName}`}>
                                <span className="material-symbols-outlined text-lg">playlist_add</span>
                            </button>
                        )}
                    </div>

                    {/* Center: Play/Pause & Metronome */}
                    <div className="flex items-center gap-3">
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
                                <div className="flex items-center gap-1 px-2 animate-slide-in-right">
                                    <input
                                        type="number"
                                        value={bpm}
                                        onChange={(e) => handleBpmChange(e.target.value)}
                                        className="w-8 text-center bg-transparent font-mono font-bold text-xs outline-none"
                                    />
                                    <span className="text-[8px] text-gray-400">BPM</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Hamburger Menu for overflow tools */}
                    <div className="sm:hidden relative group">
                        <button className="btn-ghost !p-2">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {/* Mobile Dropdown */}
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-xl rounded-xl p-3 w-48 hidden group-hover:block z-50">
                            <button onClick={() => setIsAutoScroll(!isAutoScroll)} className={`w-full text-left px-2 py-2 rounded flex items-center gap-2 text-sm ${isAutoScroll ? 'bg-blue-50 text-blue-600' : ''}`}>
                                <span className="material-symbols-outlined">swipe_up</span> Auto Scroll
                            </button>
                            <button onClick={() => setIsRehearsal(!isRehearsal)} className={`w-full text-left px-2 py-2 rounded flex items-center gap-2 text-sm ${isRehearsal ? 'bg-red-50 text-red-600' : ''}`}>
                                <span className="material-symbols-outlined">youtube_activity</span> {isRehearsal ? 'Ocultar Video' : 'Modo Ensayo'}
                            </button>

                            {/* Mobile Audio Upload */}
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="audio-upload-mobile"
                                />
                                <label
                                    htmlFor="audio-upload-mobile"
                                    className={`w-full text-left px-2 py-2 rounded flex items-center gap-2 text-sm cursor-pointer ${audioUrl ? 'bg-green-50 text-green-600' : ''}`}
                                >
                                    <span className="material-symbols-outlined">audio_file</span> {audioUrl ? 'Cambiar Audio' : 'Subir Audio (MP3)'}
                                </label>
                            </div>

                            {canDelete && (
                                <button onClick={handleDelete} className="w-full text-left px-2 py-2 rounded flex items-center gap-2 text-sm text-red-500 hover:bg-red-50">
                                    <span className="material-symbols-outlined">delete</span> Eliminar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row (Mobile) / Right Side (Desktop): Formatting Tools */}
                <div className="flex items-center justify-center w-full sm:w-auto gap-4 bg-white/50 dark:bg-white/5 p-1 rounded-lg sm:bg-transparent">
                    {/* Size Controls */}
                    <div className="flex items-center bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 h-8">
                        <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="px-2 text-gray-500 hover:bg-gray-50 text-xs font-bold">A-</button>
                        <span className="px-2 text-xs font-mono text-gray-400 border-x border-gray-100 dark:border-white/5">{fontSize}</span>
                        <button onClick={() => setFontSize(s => Math.min(48, s + 2))} className="px-2 text-gray-500 hover:bg-gray-50 text-xs font-bold">A+</button>
                    </div>

                    {/* Transpose Controls */}
                    <div className="flex items-center bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 h-8">
                        <button onClick={() => setTranspose(t => t - 1)} className="px-2 text-gray-500 hover:bg-gray-50 font-bold">-</button>
                        <span className={`w-8 text-center text-sm font-bold ${transpose !== 0 ? 'text-primary' : ''}`}>
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <button onClick={() => setTranspose(t => t + 1)} className="px-2 text-gray-500 hover:bg-gray-50 font-bold">+</button>
                    </div>

                    {/* Toggle Chords */}
                    <button
                        onClick={() => setShowChords(!showChords)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showChords ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-white/5 text-gray-400 border border-gray-200'}`}
                    >
                        <span className="material-symbols-outlined text-lg">music_note</span>
                    </button>
                </div>

                {/* Desktop Actions (Hidden on Mobile) */}
                <div className="hidden sm:flex items-center gap-2">
                    {/* Audio Upload Button */}
                    <div className="relative">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="audio-upload-desktop"
                        />
                        <label
                            htmlFor="audio-upload-desktop"
                            className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${audioUrl ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            title={audioUrl ? "Cambiar Audio" : "Subir Audio MP3"}
                        >
                            <span className="material-symbols-outlined">audio_file</span>
                        </label>
                    </div>

                    <button
                        onClick={() => setIsAutoScroll(!isAutoScroll)}
                        className={`p-2 rounded-full transition-colors ${isAutoScroll ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
                        title="Auto Scroll"
                    >
                        <span className="material-symbols-outlined">swipe_up</span>
                    </button>
                    <button
                        onClick={() => setIsRehearsal(!isRehearsal)}
                        className={`p-2 rounded-full transition-colors ${isRehearsal ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
                        title="Modo Ensayo (Video)"
                    >
                        <span className="material-symbols-outlined">youtube_activity</span>
                    </button>
                    {canDelete && (
                        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Audio Element Hidden */}
            {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}

            {/* Song Content Container: Responsive Layout */}
            <div className={`flex flex-1 overflow-hidden ${isRehearsal ? 'flex-col lg:flex-row' : 'flex-col'}`}>

                {/* VIDEO PANEL: Sticky Top on Mobile */}
                {isRehearsal && videoId && (
                    <div className="w-full lg:w-96 bg-black shrink-0 flex items-center justify-center relative lg:border-r border-gray-800 transition-all duration-300">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube play"
                            className="w-full h-48 lg:h-full aspect-video lg:aspect-auto"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* LYRICS SCROLL AREA */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto bg-stone-50 dark:bg-[#111] p-4 sm:p-12 text-center relative scroll-smooth"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    <div className="max-w-3xl mx-auto pb-48 lg:pb-0 min-h-full bg-white dark:bg-black/20 shadow-sm border border-gray-100 dark:border-white/5 p-6 sm:p-10 rounded-xl my-4">
                        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-4">{song.title}</h1>
                        <p className="text-sm text-gray-500 mb-8 italic print:hidden flex items-center justify-center gap-2">
                            <span>Clave: <strong className="text-primary">{song.key}</strong></span>
                            {transpose !== 0 && <span className="text-primary font-bold">({transpose > 0 ? '+' : ''}{transpose})</span>}
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs uppercase tracking-widest">{notationSystem === 'latin' ? 'Do Re Mi' : 'C D E'}</span>
                        </p>

                        <div className="font-serif text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-left md:text-center inline-block leading-relaxed">
                            {content}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .fixed { position: static !important; overflow: visible !important; }
                    button, .material-symbols-outlined, iframe { display: none !important; }
                    body > *:not(#root) { display: none; }
                     @page { margin: 2cm; }
                     body { background: white; color: black; }
                }
            `}</style>
        </div>,
        document.body
    );
}
