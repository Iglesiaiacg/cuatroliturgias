import { useState, useEffect } from 'react';
import { getLiturgicalColor } from '../../services/liturgy';

export default function SacristyChecklist({ date }) {
    const color = getLiturgicalColor(date);

    // Default items
    const defaultItems = [
        { id: 'misal', label: 'Misal Romano / Libro de Oración', checked: false },
        { id: 'leccionario', label: 'Leccionario (Marcado)', checked: false },
        { id: 'caliz', label: 'Cáliz, Patena y Purificador', checked: false },
        { id: 'corporal', label: 'Corporal', checked: false },
        { id: 'vinajeras', label: 'Vinajeras (Agua y Vino)', checked: false },
        { id: 'lavabo', label: 'Lavabo y Manutergio', checked: false },
        { id: 'pan', label: 'Hostias (Sificientes)', checked: false },
        { id: 'velas', label: 'Velas del Altar Encendidas', checked: false },
    ];

    // Load from local storage or use default
    const getStoredItems = () => {
        const key = `sacristy-${date.toDateString()}`;
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        return defaultItems;
    };

    const [items, setItems] = useState(getStoredItems);

    // Reset when date changes
    useEffect(() => {
        setItems(getStoredItems());
    }, [date]);

    // Toggle check
    const toggleItem = (id) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        setItems(newItems);
        localStorage.setItem(`sacristy-${date.toDateString()}`, JSON.stringify(newItems));
    };

    // Calculate progress
    const completed = items.filter(i => i.checked).length;
    const total = items.length;
    const progress = Math.round((completed / total) * 100);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Header with Liturgical Color */}
            <div className={`px-6 py-4 flex items-center justify-between border-b ${color.classes.replace('text-', 'border-').split(' ')[2]}`}>
                <div>
                    <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">Sacristía Digital</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preparación para la Santa Misa</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color.classes}`}>
                    {color.name}
                </div>
            </div>

            {/* Checklist */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left group
                            ${item.checked
                                ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                            }
                        `}
                    >
                        <div className={`
                            w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0
                            ${item.checked
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'
                            }
                        `}>
                            {item.checked && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                        </div>
                        <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-70' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 dark:bg-black/20 p-2">
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
