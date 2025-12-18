import { useState, useEffect } from 'react';
import { getLiturgicalColor } from '../../services/liturgy';

// Expanded Default items (Comprehensive) - Defined outside to be stable
const defaultItems = [
    // Libros
    { id: 'misal', label: 'Misal', checked: false },
    { id: 'leccionario', label: 'Leccionario', checked: false },
    { id: 'evangeliario', label: 'Evangeliario', checked: false },
    { id: 'guion', label: 'Guión / Oración Fieles', checked: false },

    // Altar y Credencia - Vasos
    { id: 'caliz', label: 'Cáliz y Patena', checked: false },
    { id: 'copon', label: 'Copón (si es necesario)', checked: false },
    { id: 'vinajeras', label: 'Vinajeras (Vino/Agua)', checked: false },
    { id: 'lavabo', label: 'Jarra y Jofaina (Lavabo)', checked: false },

    // Altar y Credencia - Lencería
    { id: 'corporal', label: 'Corporal y Purificador', checked: false },
    { id: 'manutergio', label: 'Manutergio', checked: false },
    { id: 'manteles', label: 'Manteles de Altar', checked: false },

    // Elementos
    { id: 'pan', label: 'Hostias (Suficientes)', checked: false },
    { id: 'velas', label: 'Velas del Altar', checked: false },
    { id: 'llaves', label: 'Llave del Sagrario', checked: false },

    // Procesión y Ritos
    { id: 'cruz', label: 'Cruz Alta / Ciriales', checked: false },
    { id: 'incensario', label: 'Incensario y Naveta', checked: false },
    { id: 'carbones', label: 'Carbones / Incienso', checked: false },
    { id: 'acetre', label: 'Acetre e Hisopo (Agua)', checked: false },
    { id: 'campanilla', label: 'Campanilla', checked: false },

    // Vestiduras
    { id: 'vestiduras', label: 'Vestiduras (Color)', checked: false },
    { id: 'micro', label: 'Micrófono / Sonido', checked: false },
];

export default function SacristyChecklist({ date }) {
    const color = getLiturgicalColor(date);
    const storageKey = `sacristy-v2-${date.toDateString()}`;

    // Initialize state from local storage or default
    const [items, setItems] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultItems;
    });

    const [isCollapsed, setIsCollapsed] = useState(true);

    // Sync state when date changes (load new date's data)
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setItems(JSON.parse(stored));
        } else {
            setItems(defaultItems);
        }
    }, [storageKey]); // Depend on storageKey which includes date

    // Save to local storage whenever items change
    // We do manual save in toggle for immediate persistence, 
    // but we could also use an effect. Sticking to manual save in handler for simplicity.

    // Toggle check
    const toggleItem = (id) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        setItems(newItems);
        localStorage.setItem(storageKey, JSON.stringify(newItems));
    };

    // Calculate progress
    const completed = items.filter(i => i.checked).length;
    const total = items.length;
    const progress = Math.round((completed / total) * 100);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300">
            {/* Header (Compact) */}
            <div
                className={`px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b ${color.classes.replace('text-', 'border-').split(' ')[2]}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color.classes.replace('bg-', 'bg-').split(' ')[0].replace('100', '500').replace('/50', '')} shadow-sm`}></div>
                    <div>
                        <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                            Sacristía Digital
                            <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 rounded-full">{color.name}</span>
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400">{completed}/{total}</span>
                        <div className="w-12 bg-gray-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-lg transform transition-transform duration-300" style={{ rotate: isCollapsed ? '180deg' : '0deg' }}>expand_less</span>
                </div>
            </div>

            {/* Checklist Grid (Collapsible) */}
            <div
                className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-1 p-2 bg-gray-50/50 dark:bg-black/20 transition-all duration-300 origin-top overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 p-0' : 'max-h-96 opacity-100'}`}
            >
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left group
                            ${item.checked
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'hover:bg-white dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
                            }
                        `}
                    >
                        <div className={`
                            w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors shrink-0
                            ${item.checked
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 group-hover:border-primary bg-white dark:bg-transparent'
                            }
                        `}>
                            {item.checked && <span className="material-symbols-outlined text-[10px] font-bold leading-none">check</span>}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium truncate w-full ${item.checked ? 'line-through opacity-60' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
