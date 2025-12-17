import { useState, useEffect } from 'react';

export default function PulpitView({ content, onClose, title }) {
    const [fontSize, setFontSize] = useState(24); // Start large
    const [theme, setTheme] = useState('light'); // light, sepia, dark

    // Handle ESC key to exit
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const themes = {
        light: 'bg-white text-gray-900',
        sepia: 'bg-[#f4ecd8] text-[#5b4636]',
        dark: 'bg-gray-900 text-gray-200'
    };

    return (
        <div className={`fixed inset-0 z-[100] overflow-y-auto ${themes[theme]} transition-colors duration-500`}>
            {/* Controls (Floating, auto-hide in future maybe, but for now fixed top-right) */}
            <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/10 backdrop-blur-md p-2 rounded-full shadow-sm hover:opacity-100 opacity-30 transition-opacity z-50 print:hidden">
                <button onClick={() => setFontSize(s => Math.max(16, s - 2))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
                    <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(60, s + 2))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full border border-gray-400 bg-white ${theme === 'light' ? 'ring-2 ring-blue-500' : ''}`} title="Luz"></button>
                <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full border border-[#5b4636] bg-[#f4ecd8] ${theme === 'sepia' ? 'ring-2 ring-blue-500' : ''}`} title="Sepia"></button>
                <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full border border-gray-600 bg-gray-900 ${theme === 'dark' ? 'ring-2 ring-blue-500' : ''}`} title="Noche"></button>
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 min-h-screen">
                {title && (
                    <h1 className="text-center font-display font-bold mb-12 opacity-80" style={{ fontSize: `${fontSize * 1.5}px` }}>
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
                            font-family: sans-serif;
                            display: block;
                            margin: 1em 0 0.5em 0;
                            font-size: 0.85em;
                            font-weight: bold;
                        }
                        strong { font-weight: 700; }
                        h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; font-family: 'Cinzel', serif; }
                        p { margin-bottom: 1em; }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
}
