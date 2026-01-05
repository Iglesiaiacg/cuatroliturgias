import { useState } from 'react';
import { useNoticesSync } from '../../hooks/useNoticesSync';
import { useAuth } from '../../context/AuthContext';

export default function NoticesCard() {
    const { notices, addNotice, removeNotice, markAsRead, loading } = useNoticesSync();
    const { checkPermission, userRole, currentUser } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [targetAudience, setTargetAudience] = useState('all');
    const [readMode, setReadMode] = useState(false);
    const [viewingStats, setViewingStats] = useState(null); // ID of notice to show stats for

    const canManage = userRole === 'admin' || userRole === 'director' || (checkPermission && checkPermission('manage_communication'));

    // --- FILTER LOGIC ---
    // Show notices that are targeted to 'all' OR targeted to my specific role
    const myNotices = notices.filter(n => {
        if (!n.target || n.target === 'all') return true;
        if (canManage) return true; // Admins see everything

        // Map target names to role checks
        if (n.target === 'musicians' && (userRole === 'musician' || userRole === 'director')) return true;
        if (n.target === 'lectors' && userRole === 'lector') return true;
        if (n.target === 'parishioners' && (!userRole || userRole === 'guest')) return true;

        return false;
    });

    const unreadCount = myNotices.filter(n => !n.readBy?.includes(currentUser?.uid)).length;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        addNotice(inputValue.trim(), targetAudience);
        setInputValue('');
        setTargetAudience('all');
    };

    const handleDelete = (id) => {
        if (confirm('¿Borrar aviso permanentemente?')) {
            removeNotice(id);
        }
    };

    const toggleReadStatus = (notice) => {
        if (!notice.readBy?.includes(currentUser?.uid)) {
            markAsRead(notice.id);
        }
    };

    const getTargetLabel = (t) => {
        switch (t) {
            case 'musicians': return 'Músicos';
            case 'lectors': return 'Lectores';
            case 'parishioners': return 'Feligreses';
            default: return 'General';
        }
    };

    // --- FULL SCREEN READ MODE ---
    if (readMode) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 md:p-12 flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-white/10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">Avisos Parroquiales</h2>
                        <p className="text-sm text-gray-500">Boletín semanal y notificaciones</p>
                    </div>
                    <button
                        onClick={() => setReadMode(false)}
                        className="w-10 h-10 neumorphic-btn flex items-center justify-center rounded-full"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full pb-20">
                    {myNotices.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">notifications_off</span>
                            </div>
                            <p className="text-xl text-gray-400 italic">No hay avisos para ti esta semana.</p>
                        </div>
                    ) : (
                        myNotices.map((notice) => {
                            const isRead = notice.readBy?.includes(currentUser?.uid);
                            return (
                                <div key={notice.id} className={`p-6 rounded-2xl border transition-all ${isRead ? 'bg-gray-50 dark:bg-white/5 border-transparent' : 'bg-white dark:bg-stone-900 border-primary/20 shadow-lg ring-1 ring-primary/10'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${notice.target === 'all' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {getTargetLabel(notice.target)}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Semanal'}
                                        </span>
                                    </div>

                                    <p className="text-xl md:text-2xl text-stone-800 dark:text-white font-medium leading-relaxed mb-6">
                                        {notice.text}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/20 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                                {notice.author?.charAt(0) || 'A'}
                                            </div>
                                            <span className="text-xs text-gray-500 font-bold">{notice.author || 'Admin'}</span>
                                        </div>

                                        <button
                                            onClick={() => toggleReadStatus(notice)}
                                            disabled={isRead}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                                                ${isRead
                                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 cursor-default'
                                                    : 'text-white bg-primary shadow-md hover:scale-105 active:scale-95'}
                                            `}
                                        >
                                            <span className="material-symbols-outlined text-lg">{isRead ? 'done_all' : 'check'}</span>
                                            {isRead ? 'Enterado' : 'Marcar como Enterado'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    // --- DASHBOARD CARD MODE ---
    return (
        <div className="neumorphic-card p-6 h-full flex flex-col relative overflow-visible">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="relative">
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Avisos</span>
                </div>
                <button
                    onClick={() => setReadMode(true)}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                    disabled={myNotices.length === 0}
                >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Leer {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {canManage && (
                <div className="mb-4 space-y-2">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribir aviso..."
                                className="w-full neumorphic-inset px-3 py-2 text-sm outline-none bg-transparent text-stone-900 dark:text-stone-100 rounded-lg pr-8"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0"
                            disabled={!inputValue.trim()}
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </form>

                    {/* Targeting Dropdown */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {['all', 'musicians', 'lectors', 'parishioners'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTargetAudience(t)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors border
                                    ${targetAudience === t
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-transparent text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300'
                                    }`}
                            >
                                {t === 'all' ? 'Todos' : getTargetLabel(t)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-[100px] pr-1 space-y-2">
                {myNotices.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined text-2xl mb-1">mark_email_read</span>
                        <span className="text-xs">Todo al día</span>
                    </div>
                ) : (
                    myNotices.map(item => {
                        const isRead = item.readBy?.includes(currentUser?.uid);
                        return (
                            <div key={item.id} className={`group flex flex-col p-2.5 rounded-lg transition-colors border ${isRead ? 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5 opacity-70' : 'bg-white dark:bg-black/20 border-l-2 border-l-primary shadow-sm'}`}>
                                <div className="flex justify-between items-start gap-2">
                                    <span className={`text-sm leading-tight ${isRead ? 'text-gray-500' : 'text-stone-900 dark:text-stone-100 font-medium'}`}>
                                        {item.text}
                                    </span>
                                    {canManage && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-300 hover:text-red-500 transition-all shrink-0 p-1"
                                        >
                                            <span className="material-symbols-outlined text-xs">delete</span>
                                        </button>
                                    )}
                                </div>
                                <div className="mt-1.5 flex justify-between items-center">
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.target !== 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}>
                                        {getTargetLabel(item.target)}
                                    </span>

                                    {canManage ? (
                                        <span className="text-[9px] text-gray-400 flex items-center gap-1" title="Visto por">
                                            <span className="material-symbols-outlined text-[10px]">visibility</span>
                                            {item.readBy?.length || 0}
                                        </span>
                                    ) : (
                                        !isRead && (
                                            <button
                                                onClick={() => toggleReadStatus(item)}
                                                className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                            >
                                                Marcar leído
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
