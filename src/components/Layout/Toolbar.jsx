export default function Toolbar({ onPrint, onDownloadFull, onDownloadBulletin, onPulpitMode, onMinistries, rubricLevel, onToggleRubric }) {
    return (
        <div id="toolbar" className="relative md:sticky md:top-8 z-30 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full px-4 py-2 flex flex-wrap items-center gap-2 md:gap-4 transition-all justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6 mx-auto max-w-fit">

            {/* Rubric Level Toggle (Now inside Liturgy Toolbar) */}
            <button
                onClick={onToggleRubric}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wider"
                title={`Nivel de Rúbricas: ${rubricLevel === 'solemn' ? 'Solemne' : 'Simple'}`}
            >
                <span>{rubricLevel === 'solemn' ? '🔴' : '⭕'}</span> {rubricLevel === 'solemn' ? 'Rúbricas' : 'Simple'}
            </button>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>

            <button onClick={onPrint} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wider">
                <span>🖨️</span> Print
            </button>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
            <button onClick={onDownloadFull} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wider">
                <span>📜</span> Guion
            </button>
            <button onClick={onDownloadBulletin} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wider">
                <span>👥</span> Boletín
            </button>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
            <button onClick={onMinistries} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wider" title="Asignar Ministerios">
                <span>🤝</span> Ministerios
            </button>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
            <button onClick={onPulpitMode} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary hover:text-red-700 transition-colors uppercase tracking-wider bg-red-50 hover:bg-red-100 rounded-lg ml-2">
                <span>📖</span> Modo Púlpito
            </button>
        </div>
    );
}
