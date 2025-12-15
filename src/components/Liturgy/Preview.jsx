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
                className="page-preview font-serif bg-white shadow-2xl p-12 md:p-20 rounded-none md:rounded-lg min-h-[min(90vh,29.7cm)] w-full max-w-[21cm] outline-none focus:ring-0 transition-all text-gray-900 leading-relaxed text-[11pt] border-t-4 border-teal-700/20"
                contentEditable={true}
                suppressContentEditableWarning={true}
            >
                {/* Liturgy Header Icon */}
                <div className="flex justify-center mb-8 text-teal-700 opacity-80"
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
