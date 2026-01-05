import { useState } from 'react';
import { useIntentionsSync } from '../../hooks/useIntentionsSync';
import { useAuth } from '../../context/AuthContext';

export default function IntentionsCard({ date }) {
    const { userRole, checkPermission } = useAuth();

    // LOGIC: Default to Next Sunday if 'date' is today or missing, to allow mid-week accumulation.
    const getTargetDate = (inputDate) => {
        const d = inputDate || new Date();
        // If it's already a Sunday, keep it. If it's Mon-Sat, move to Next Sunday.
        if (d.getDay() === 0) return d;
        const nextSunday = new Date(d);
        nextSunday.setDate(d.getDate() + (7 - d.getDay()));
        return nextSunday;
    };

    const targetDate = getTargetDate(date);
    const { intentions, addIntention, removeIntention, toggleIntention, loading } = useIntentionsSync(targetDate);

    const [newItem, setNewItem] = useState('');
    const [type, setType] = useState('difuntos'); // difuntos, salud, accion_gracias
    const [successMsg, setSuccessMsg] = useState('');

    const canViewList = userRole === 'admin' || userRole === 'priest' || (checkPermission && (checkPermission('view_directory') || checkPermission('manage_sacristy')));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        addIntention(newItem, type);
        setNewItem('');
        setSuccessMsg('Intención enviada al altar.');
        setTimeout(() => setSuccessMsg(''), 3000);
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
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {canViewList ? 'Intenciones del Altar' : 'Pedir Intención'}
                    </span>
                </div>
                {canViewList && (
                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">
                        {intentions.length}
                    </span>
                )}
            </div>

            {/* LIST VIEW (Privileged Only) */}
            {canViewList ? (
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                    {intentions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs italic">
                            No hay intenciones anotadas para el domingo.
                        </div>
                    ) : (
                        intentions.map(item => (
                            <div key={item.id} className={`flex items-center justify-between group neumorphic-inset p-3 rounded-xl transition-all ${item.completed ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {(userRole === 'admin' || userRole === 'priest' || checkPermission && checkPermission('manage_sacristy')) && (
                                        <button
                                            onClick={() => toggleIntention(item.id)}
                                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0
                                                ${item.completed
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 hover:border-gray-400'}`}
                                        >
                                            {item.completed && <span className="material-symbols-outlined text-xs">check</span>}
                                        </button>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase ${item.type === 'difuntos' ? 'text-gray-500' :
                                                item.type === 'salud' ? 'text-red-400' : 'text-yellow-500'
                                                }`}>
                                                {getTypeLabel(item.type)}
                                            </span>
                                            {item.requestedBy && (
                                                <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">person</span>
                                                    {item.requestedBy}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-sm text-gray-700 dark:text-gray-200 truncate ${item.completed ? 'line-through text-gray-400' : ''}`}>
                                            {item.text}
                                        </span>
                                    </div>
                                </div>
                                {(userRole === 'admin' || (checkPermission && checkPermission('manage_sacristy'))) && (
                                    <button
                                        onClick={() => removeIntention(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0 p-1"
                                        title="Eliminar petición"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // GUEST VIEW (Information / Privacy Notice)
                <div className="mb-4 text-xs text-gray-500 italic p-3 neumorphic-inset rounded-lg text-center">
                    Escribe aquí tu petición. Se presentará en el altar este domingo.
                </div>
            )}

            {/* INPUT FORM (For Everyone) */}
            <form onSubmit={handleSubmit} className="mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                {successMsg ? (
                    <div className="bg-green-100 text-green-700 p-2 rounded-lg text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {successMsg}
                    </div>
                ) : (
                    <>
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
                                className="neumorphic-btn w-10 h-10 text-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                title="Enviar al Altar"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_upward</span>
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}
