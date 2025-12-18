import { useState, useEffect } from 'react';

const DEFAULT_ITEMS = [
    { id: 'wine', name: 'Vino de Consagrar' },
    { id: 'hosts', name: 'Formas (Hostias)' },
    { id: 'candles', name: 'Velas de Altar' },
    { id: 'oil', name: 'Aceite de Velas' },
    { id: 'incense', name: 'Incienso / Carbón' },
];

export default function InventoryCard() {
    const [inventory, setInventory] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem('liturgia_inventory');
        if (stored) {
            setInventory(JSON.parse(stored));
        } else {
            // Initialize defaults: 0 = OK, 1 = Warning, 2 = Critical
            const defaults = {};
            DEFAULT_ITEMS.forEach(item => defaults[item.id] = 0);
            setInventory(defaults);
        }
    }, []);

    const toggleStatus = (id) => {
        setInventory(prev => {
            const current = prev[id] || 0;
            const next = (current + 1) % 3;
            const newState = { ...prev, [id]: next };
            localStorage.setItem('liturgia_inventory', JSON.stringify(newState));
            return newState;
        });
    };

    const getStatusColor = (status) => {
        if (status === 2) return 'bg-red-500 shadow-red-500/50';
        if (status === 1) return 'bg-yellow-500 shadow-yellow-500/50';
        return 'bg-green-500 shadow-green-500/50';
    };

    const getStatusLabel = (status) => {
        if (status === 2) return 'Crítico';
        if (status === 1) return 'Bajo';
        return 'OK';
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 h-full">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                <span className="text-xs font-bold uppercase tracking-wider">Insumos Sacristía</span>
            </div>

            <div className="space-y-3">
                {DEFAULT_ITEMS.map(item => {
                    const status = inventory[item.id] || 0;
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleStatus(item.id)}
                            className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group select-none"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-60 transition-opacity">
                                    {getStatusLabel(status)}
                                </span>
                                <div className={`w-3 h-3 rounded-full shadow-sm transition-all duration-300 ${getStatusColor(status)}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-center">
                <p className="text-[10px] text-gray-400">Clic para cambiar estado</p>
            </div>
        </div>
    );
}
