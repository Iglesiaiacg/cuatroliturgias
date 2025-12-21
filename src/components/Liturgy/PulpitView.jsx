import { useState, useEffect, useRef } from 'react';
import { useIntentionsSync } from '../../hooks/useIntentionsSync';

export default function PulpitView({ content, onClose, title, date }) {
    const [fontSize, setFontSize] = useState(36); // Start larger for pulpit
    const [theme, setTheme] = useState('light'); // light, sepia, dark
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(2); // 1-5

    const [showControls, setShowControls] = useState(true);
    const [showBriefing, setShowBriefing] = useState(false);

    // Data for Briefing
    const { intentions } = useIntentionsSync(date || new Date());
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('liturgia_notices');
        if (stored) setNotices(JSON.parse(stored));
    }, [showBriefing]); // Refresh when opening

    // Timer State
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [, setTick] = useState(0); // Force re-render for clock

    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Clock Interval
    useEffect(() => {
        const i = setInterval(() => setTick(t => t + 1), 1000); // Update clock every second
        return () => clearInterval(i);
    }, []);

    // Stopwatch Interval
    useEffect(() => {
        let i;
        if (isTimerActive) {
            i = setInterval(() => setTimerSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(i);
    }, [isTimerActive]);

    // Handle ESC key to exit
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(p => !p); // Space to toggle play/pause
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Auto-Scroll Logic
    useEffect(() => {
        const scroll = () => {
            if (containerRef.current && isPlaying) {
                containerRef.current.scrollTop += (speed * 0.5); // Adjust multiplier for smoothness
                animationRef.current = requestAnimationFrame(scroll);
            }
        };

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(scroll);
        } else {
            cancelAnimationFrame(animationRef.current);
        }

        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, speed]);

    // Hide Controls on Inactivity
    useEffect(() => {
        const resetControls = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) setShowControls(false); // Only hide if playing/reading
            }, 3000);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', resetControls);
            container.addEventListener('click', resetControls);
            container.addEventListener('touchstart', resetControls);
        }

        resetControls(); // Init

        return () => {
            if (container) {
                container.removeEventListener('mousemove', resetControls);
                container.removeEventListener('click', resetControls);
                container.removeEventListener('touchstart', resetControls);
            }
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    const themes = {
        light: 'bg-white text-gray-900',
        sepia: 'bg-[#f4ecd8] text-[#5b4636]',
        dark: 'bg-gray-900 text-gray-200'
    };

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] overflow-y-auto ${themes[theme]} transition-colors duration-500 scroll-smooth`}
        >
            {/* Controls Bar */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-500 z-50 print:hidden ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                {/* Main Control Deck */}
                <div className="flex items-center gap-2 md:gap-3 bg-black/80 backdrop-blur-md p-2 md:p-3 rounded-2xl shadow-2xl border border-white/10 max-w-[92vw] overflow-x-auto no-scrollbar">

                    {/* Timer & Clock Display (New) */}
                    <div className="flex flex-col items-center px-2 mr-2 border-r border-white/20">
                        {/* Real-time Clock */}
                        <div className="text-xs font-bold text-gray-400 font-mono mb-1">
                            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {/* User Timer */}
                        <div onClick={() => setIsTimerActive(!isTimerActive)} className="cursor-pointer flex items-center gap-1 group">
                            <span className={`w-2 h-2 rounded-full ${isTimerActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                            <span className={`text-xl font-mono font-bold ${isTimerActive ? 'text-white' : 'text-gray-500'}`}>
                                {new Date(timerSeconds * 1000).toISOString().substr(14, 5)}
                            </span>
                        </div>
                    </div>

                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/30'}`}
                    >
                        <span className="material-symbols-outlined text-3xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Speed Control */}
                    <div className="flex flex-col items-center px-1 md:px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Velocidad</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setSpeed(s => Math.max(1, s - 0.5))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
                            <span className="text-sm font-bold w-4 text-center text-white">{speed}</span>
                            <button onClick={() => setSpeed(s => Math.min(10, s + 0.5))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Briefing Toggle */}
                    <button
                        onClick={() => setShowBriefing(!showBriefing)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${showBriefing ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'}`}
                        title="Notas del Celebrante"
                    >
                        <span className="material-symbols-outlined text-2xl">assignment</span>
                        {/* Dot indicator if there are items */}
                        {(intentions.length > 0 || notices.length > 0) && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Font Size */}
                    <div className="flex flex-col items-center px-1 md:px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tamaño</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setFontSize(s => Math.max(20, s - 4))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">text_decrease</span></button>
                            <span className="text-sm font-bold w-8 text-center text-white">{fontSize}</span>
                            <button onClick={() => setFontSize(s => Math.min(100, s + 4))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">text_increase</span></button>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Theme Toggles */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full border border-gray-400 bg-white ${theme === 'light' ? 'ring-2 ring-blue-500' : 'opacity-50 hover:opacity-100'}`} title="Luz"></button>
                        <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full border border-[#5b4636] bg-[#f4ecd8] ${theme === 'sepia' ? 'ring-2 ring-blue-500' : 'opacity-50 hover:opacity-100'}`} title="Sepia"></button>
                        <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full border border-gray-600 bg-gray-900 ${theme === 'dark' ? 'ring-2 ring-blue-500' : 'opacity-50 hover:opacity-100'}`} title="Noche"></button>
                    </div>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Close */}
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-[50vh] min-h-screen">
                {title && (
                    <h1 className="text-center font-display font-bold mb-16 opacity-80 leading-tight" style={{ fontSize: `${fontSize * 1.5}px` }}>
                        {title}
                    </h1>
                )}

                <div
                    className="prose max-w-none font-serif leading-relaxed"
                    style={{
                        fontSize: `${fontSize}px`,
                        '--tw-prose-body': 'inherit',
                        '--tw-prose-headings': 'inherit',
                        '--tw-prose-bold': 'inherit'
                    }}
                >
                    {/* Inject content securely */}
                    <style>{`
                        .rubric { 
                            color: ${theme === 'dark' ? '#ef4444' : '#dc2626'}; 
                            font-style: italic; 
                            font-family: ui-sans-serif, system-ui, sans-serif;
                            display: block;
                            margin: 1.5em 0 0.5em 0;
                            font-size: 0.75em;
                            font-weight: 600;
                            opacity: 0.9;
                        }
                        strong { font-weight: 700; opacity: 1; }
                        h1, h2, h3 { margin-top: 2em; margin-bottom: 0.8em; line-height: 1.1; font-family: 'Cinzel', serif; opacity: 0.9; }
                        p { margin-bottom: 1.2em; opacity: 0.95; }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
            {/* Briefing Sidebar (Celebrant's Notes) */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-[110] transition-transform duration-300 transform ${showBriefing ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-display font-bold text-amber-500 flex items-center gap-2">
                            <span className="material-symbols-outlined">assignment</span>
                            Mesa del Celebrante
                        </h2>
                        <button onClick={() => setShowBriefing(false)} className="text-gray-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Intentions Section */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">Intenciones</h3>
                        {intentions.length === 0 ? (
                            <p className="text-gray-600 italic text-sm">No hay intenciones.</p>
                        ) : (
                            <ul className="space-y-3">
                                {intentions.map(i => (
                                    <li key={i.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <span className={`text-[10px] font-bold uppercase block mb-1 ${i.type === 'difuntos' ? 'text-gray-400' : 'text-amber-400'}`}>
                                            {i.type === 'difuntos' ? '✞ Difunto' : i.type === 'salud' ? 'Salud' : 'Acción de Gracias'}
                                        </span>
                                        <span className="text-gray-200 font-medium text-lg">{i.text}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Notices Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">Avisos Parroquiales</h3>
                        {notices.length === 0 ? (
                            <p className="text-gray-600 italic text-sm">No hay avisos.</p>
                        ) : (
                            <ul className="space-y-4">
                                {notices.map((n, idx) => (
                                    <li key={n.id} className="flex gap-3 items-start">
                                        <span className="text-amber-500 font-bold text-lg">{idx + 1}.</span>
                                        <span className="text-gray-300 leading-relaxed text-lg">{n.text}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
