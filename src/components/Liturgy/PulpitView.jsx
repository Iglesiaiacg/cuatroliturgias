import { useState, useEffect, useRef } from 'react';

export default function PulpitView({ content, onClose, title }) {
    const [fontSize, setFontSize] = useState(36); // Start larger for pulpit
    const [theme, setTheme] = useState('light'); // light, sepia, dark
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(2); // 1-5
    const [showControls, setShowControls] = useState(true);

    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

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
                <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/10">

                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/30'}`}
                    >
                        <span className="material-symbols-outlined text-3xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Speed Control */}
                    <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Velocidad</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSpeed(s => Math.max(1, s - 0.5))} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-lg">remove</span></button>
                            <span className="text-sm font-bold w-4 text-center text-white">{speed}</span>
                            <button onClick={() => setSpeed(s => Math.min(10, s + 0.5))} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-lg">add</span></button>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20 mx-1"></div>

                    {/* Font Size */}
                    <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tamaño</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setFontSize(s => Math.max(20, s - 4))} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-lg">text_decrease</span></button>
                            <span className="text-sm font-bold w-6 text-center text-white">{fontSize}</span>
                            <button onClick={() => setFontSize(s => Math.min(100, s + 4))} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-lg">text_increase</span></button>
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
        </div>
    );
}
