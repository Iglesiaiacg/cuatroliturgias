import { useState } from 'react';

export default function NoticesCard() {
    const [notices, setNotices] = useState(() => {
        const stored = localStorage.getItem('liturgia_notices');
        return stored ? JSON.parse(stored) : [];
    });
    const [inputValue, setInputValue] = useState('');
    const [readMode, setReadMode] = useState(false);

    const saveNotices = (newNotices) => {
        setNotices(newNotices);
        localStorage.setItem('liturgia_notices', JSON.stringify(newNotices));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newNotices = [...notices, { id: Date.now(), text: inputValue.trim() }];
        saveNotices(newNotices);
        setInputValue('');
    };

    const handleDelete = (id) => {
        const newNotices = notices.filter(i => i.id !== id);
        saveNotices(newNotices);
    };

    if (readMode) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-8 md:p-12 flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-white/10">
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Avisos Parroquiales</h2>
                    <button
                        onClick={() => setReadMode(false)}
                        className="w-10 h-10 neumorphic-btn"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-8 max-w-4xl mx-auto w-full">
                    {notices.length === 0 ? (
                        <p className="text-2xl text-center text-gray-400 italic mt-20">No hay avisos para leer.</p>
                    ) : (
                        notices.map((notice, idx) => (
                            <div key={notice.id} className="flex gap-6 items-start">
                                <span className="text-4xl font-bold text-primary/30">{idx + 1}</span>
                                <p className="text-3xl md:text-4xl text-stone-900 dark:text-white font-medium leading-relaxed">
                                    {notice.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="neumorphic-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <span className="material-symbols-outlined text-sm">campaign</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Avisos</span>
                </div>
                <button
                    onClick={() => setReadMode(true)}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                    disabled={notices.length === 0}
                >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Leer
                </button>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nuevo aviso..."
                    className="flex-1 neumorphic-inset px-4 py-3 text-sm outline-none bg-transparent"
                />
                <button
                    type="submit"
                    className="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                    disabled={!inputValue.trim()}
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </form>

            <div className="flex-1 overflow-y-auto min-h-[100px] pr-2 space-y-2">
                {notices.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                        <span className="text-xs">Sin avisos para el domingo</span>
                    </div>
                ) : (
                    notices.map(item => (
                        <div key={item.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors text-sm">
                            <span className="text-stone-900 dark:text-stone-100 line-clamp-2">{item.text}</span>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0 ml-2"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
