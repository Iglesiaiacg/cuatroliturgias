import { useSacristySync } from '../../hooks/useSacristySync';
import StyledCard from '../Common/StyledCard';

export default function SacristyStatusCard({ date }) {
    const { items, loading } = useSacristySync(date || new Date());

    if (loading) {
        return (
            <div className="neumorphic-card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    const total = items.length;
    const completed = items.filter(i => i.checked).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = progress === 100;

    const getStatusColor = () => {
        if (isComplete) return 'text-green-600';
        if (progress > 50) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getStatusIcon = () => {
        if (isComplete) return 'check_circle';
        if (progress > 0) return 'pending';
        return 'error';
    };

    return (
        <div className="neumorphic-card p-6 relative overflow-hidden group">
            {/* Background Progress Bar (Subtle) */}
            <div
                className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: isComplete ? 'var(--color-primary)' : '' }}
            />

            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Sacristía</h3>
                    <p className="text-xs text-gray-500">Preparación de la Misa</p>
                </div>
                <span className={`material-symbols-outlined text-3xl ${getStatusColor()} transition-colors duration-300`}>
                    {getStatusIcon()}
                </span>
            </div>

            <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white font-display">
                    {progress}%
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {completed} / {total} ítems
                </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden inner-shadow">
                <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="text-xs text-gray-500 text-center">
                {isComplete
                    ? "Todo listo para la celebración."
                    : "Faltan elementos por preparar."}
            </div>
        </div>
    );
}
