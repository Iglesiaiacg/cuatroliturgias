import { forwardRef } from 'react';
import { CONFIG } from '../../services/config';

const Preview = forwardRef(({ content, season }, ref) => {
    // Generate header icon based on season
    const iconHtml = CONFIG.ICONS[season] || CONFIG.ICONS['ordinario'];

    return (
        <div className="w-full max-w-4xl animate-slide-in">
            {/* Edit Hint */}
            <p className="text-xs text-center text-gray-400 mt-2 mb-6 italic animate-pulse">
                💡 Puedes editar el texto directamente haciendo clic sobre él
            </p>

            <div
                ref={ref}
                id="doc-content"
                className="page-preview liturgy-content preview-paper-texture mx-auto min-h-[50vh] md:min-h-[29.7cm] w-full md:w-[21cm] p-4 md:p-[2cm] outline-none text-[10pt] md:text-[11pt] leading-relaxed break-words transition-all duration-300 relative"
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
