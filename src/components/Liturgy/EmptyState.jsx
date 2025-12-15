export default function EmptyState() {
    return (
        <div id="empty-state" className="flex flex-col items-center justify-center text-gray-400 mt-20 md:mt-32 max-w-sm text-center opacity-70 transition-all duration-500">
            <div className="neu-flat p-10 rounded-full mb-8 animate-pulse bg-white/50 border border-gray-100 shadow-sm">
                <svg className="w-20 h-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-.83 0-1.5-.67-1.5-1.5h3c0 .83-.67 1.5-1.5 1.5zm0-10c-2.76 0-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3H17c0-2.76-2.24-5-5-5z" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-3">La Palabra de Dios te espera</h2>
            <p className="text-lg text-gray-500">Comience su discernimiento eligiendo el Rito y el Propio Litúrgico que desea preparar.</p>
        </div>
    );
}
