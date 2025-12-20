import { useState } from 'react';
import { getLiturgicalColor } from '../../services/liturgy';
import { useSacristySync } from '../../hooks/useSacristySync';

export default function SacristyChecklist({ date }) {
    const color = getLiturgicalColor(date);
    const { items, toggleItem, loading } = useSacristySync(date);
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Calculate progress
    const completed = items.filter(i => i.checked).length;
    const total = items.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

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
                            {loading && <span className="text-[10px] text-primary animate-pulse ml-2">Sincronizando...</span>}
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

            {/* Warning for Sunday/Feasts */}
            {(!isCollapsed && (date.getDay() === 0 || !color.name.toLowerCase().includes('verde'))) && (
                <div className="mx-3 mt-2 mb-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg flex items-center gap-2 animate-fade-in">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">warning</span>
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Revisa que no falte nada para la celebración.</span>
                </div>
            )}

            {/* Checklist Grid (Collapsible) */}
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50/50 dark:bg-black/20 transition-all duration-300 origin-top overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 p-0' : 'max-h-[800px] opacity-100'}`}
            >
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        disabled={loading}
                        className={`flex items-start gap-2 px-2 py-2 rounded-md transition-all text-left group
                            ${item.checked
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'hover:bg-white dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
                            }
                        `}
                    >
                        <div className={`
                            mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0
                            ${item.checked
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 group-hover:border-primary bg-white dark:bg-transparent'
                            }
                        `}>
                            {item.checked && <span className="material-symbols-outlined text-[10px] font-bold leading-none">check</span>}
                        </div>
                        <span className={`text-xs font-medium leading-tight ${item.checked ? 'line-through opacity-60' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
