import { useInventorySync } from '../../hooks/useInventorySync';

export default function InventoryCard() {
    const { items, toggleStatus, loading } = useInventorySync();

    const getStatusColor = (status) => {
        switch (status) {
            case 'ok': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ok': return 'OK';
            case 'warning': return 'Bajo';
            case 'critical': return 'Critico';
            default: return '?';
        }
    };

    return (
        <div className="neumorphic-card p-6 h-full relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                <span className="text-xs font-bold uppercase tracking-wider">Insumos Sacristía</span>
            </div>

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between group">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                        <button
                            onClick={() => toggleStatus(item.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${getStatusColor(item.status)}`}
                        >
                            {getStatusLabel(item.status)}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-[10px] text-gray-400 text-center">
                    Toca el estado para cambiarlo.
                </p>
            </div>
        </div>
    );
}
