export default function Loading({ tip = "Cargando..." }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-white/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{tip}</p>
        </div>
    );
}
