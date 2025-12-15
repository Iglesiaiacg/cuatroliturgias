export default function Toolbar({ onPrint, onDownloadFull, onDownloadBulletin }) {
    return (
        <div id="toolbar" className="sticky top-6 z-30 bg-white border border-gray-200 rounded-xl px-8 py-4 flex flex-wrap items-center gap-6 transition-all justify-center transform hover:scale-[1.01] shadow-lg mb-8">
            <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-teal-700 font-bold transition-colors">
                <span>🖨️</span> Imprimir
            </button>
            <div className="w-px h-8 bg-gray-300 hidden md:block"></div>
            <button onClick={onDownloadFull} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-teal-700 font-bold transition-colors">
                <span>📜</span> Guion Completo
            </button>
            <button onClick={onDownloadBulletin} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-teal-700 font-bold transition-colors">
                <span>👥</span> Boletín Pueblo
            </button>
        </div>
    );
}
