export default function Toolbar({ onPrint, onDownloadFull, onDownloadBulletin }) {
    return (
        <div id="toolbar" className="sticky top-24 z-30 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full px-6 py-2 flex flex-wrap items-center gap-4 transition-all justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-8">
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
        </div>
    );
}
