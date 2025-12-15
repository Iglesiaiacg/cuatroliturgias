export default function Loading({ tip }) {
    return (
        <div id="loading-state" className="flex flex-col items-center justify-center mt-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mb-8"></div>
            <p className="text-teal-700 font-bold text-base tracking-widest uppercase animate-pulse">Consultando Rúbricas...</p>
            <p className="text-gray-400 text-xs mt-4 max-w-xs text-center italic transition-opacity duration-500">
                "{tip}"
            </p>
        </div>
    );
}
