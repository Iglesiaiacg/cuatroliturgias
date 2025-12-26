import { useState } from 'react';
import { useIntentionsSync } from '../../hooks/useIntentionsSync';

export default function IntentionsCard({ date }) {
    const { intentions, addIntention, removeIntention, loading } = useIntentionsSync(date);
    const [newItem, setNewItem] = useState('');
    const [type, setType] = useState('difuntos'); // difuntos, salud, accion_gracias

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        addIntention(newItem, type);
        setNewItem('');
    };

    const getTypeLabel = (t) => {
        switch (t) {
            case 'difuntos': return '✞ Difunto';
            case 'salud': return '♥ Salud';
            case 'accion_gracias': return '★ Acción de Gracias';
            default: return 'Intención';
        }
    };

    return (
        <div className="neumorphic-card p-6 h-full flex flex-col relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">event_note</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Intenciones</span>
                </div>
                <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">
                    {intentions.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                {intentions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic">
                        No hay intenciones anotadas para hoy.
                    </div>
                ) : (
                    intentions.map(item => (
                        <div key={item.id} className="flex items-center justify-between group neumorphic-inset p-3 rounded-xl transition-all">
                            <div>
                                <span className={`text-[10px] font-bold uppercase mr-2 ${item.type === 'difuntos' ? 'text-gray-500' :
                                    item.type === 'salud' ? 'text-red-400' : 'text-yellow-500'
                                    }`}>
                                    {getTypeLabel(item.type)}
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-200">{item.text}</span>
                            </div>
                            {(userRole === 'admin' || (checkPermission && checkPermission('manage_sacristy'))) && (
                                <button
                                    onClick={() => removeIntention(item.id)}
                                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {(userRole === 'admin' || (checkPermission && checkPermission('manage_sacristy'))) && (
                <form onSubmit={handleSubmit} className="mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                        {['difuntos', 'salud', 'accion_gracias'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all ${type === t
                                    ? 'neumorphic-inset text-primary box-shadow-inner'
                                    : 'neumorphic-btn text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {getTypeLabel(t)}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Nombre / Intención..."
                            className="flex-1 neumorphic-inset px-4 py-2 text-sm outline-none bg-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!newItem.trim()}
                            className="neumorphic-btn w-10 h-10 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
