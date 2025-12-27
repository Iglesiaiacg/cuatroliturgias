import { forwardRef, useState } from 'react';
import { CONFIG } from '../../services/config';

const Preview = forwardRef(({ content, season, rubricLevel }, ref) => {
    // Generate header icon based on season
    const iconHtml = CONFIG.ICONS[season] || CONFIG.ICONS['ordinario'];

    const [activeNote, setActiveNote] = useState(null);

    const handleContentClick = (e) => {
        const target = e.target.closest('.mystagogy');
        if (target) {
            e.preventDefault();
            const note = target.getAttribute('data-note');
            setActiveNote(note);
        } else {
            // Close note if clicking elsewhere
            setActiveNote(null);
        }
    };

    return (
        <div className={`w-full max-w-4xl animate-slide-in relative ${rubricLevel === 'solemn' ? 'mode-solemn' : ''}`}>
            {/* Annotation Popover */}
            {activeNote && (
                <div className="fixed bottom-8 right-8 z-50 w-72 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-2xl border-l-4 border-primary animate-slide-up">
                    <button
                        onClick={() => setActiveNote(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Mistagogia</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        {activeNote}
                    </p>
                </div>
            )}

            {/* Edit Hint */}
            <p className="text-xs text-center text-gray-400 mt-2 mb-6 italic animate-pulse">
                💡 Puedes editar el texto directamente haciendo clic sobre él
            </p>

            <div
                ref={ref}
                id="doc-content"
                onClick={handleContentClick}
                className="page-preview liturgy-content preview-paper-texture mx-auto min-h-[50vh] md:min-h-[29.7cm] w-full max-w-full md:w-[21cm] p-6 md:p-[2cm] outline-none text-[12pt] md:text-[11pt] leading-relaxed break-words transition-all duration-300 relative shadow-xl"
                contentEditable={true}
                suppressContentEditableWarning={true}
            >
                {/* Watermark/Symbol Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 opacity-[0.02] pointer-events-none flex items-center justify-center">
                    <span className="material-symbols-outlined text-[300px]">church</span>
                </div>

                <style>{`
                    /* Print Overrides */
                    @media print {
                        .page-preview {
                            box-shadow: none !important;
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                            max-width: none !important;
                        }
                    }
                `}</style>
                {/* Liturgy Header Icon */}
                <div className="flex justify-center mb-8 text-primary opacity-80"
                    dangerouslySetInnerHTML={{ __html: iconHtml }}
                    style={{ width: '48px', height: '48px', margin: '0 auto 2rem auto' }}
                />

                {/* Main Content */}
                <div
                    className="liturgy-content space-y-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
});

export default Preview;
