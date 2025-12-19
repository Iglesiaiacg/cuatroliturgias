import { useState, useEffect } from 'react';

export default function IntentionsCard() {
    const [intentions, setIntentions] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('liturgia_intentions');
        if (stored) {
            setIntentions(JSON.parse(stored));
        }
    }, []);

    const saveIntentions = (newIntentions) => {
        setIntentions(newIntentions);
        localStorage.setItem('liturgia_intentions', JSON.stringify(newIntentions));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newIntentions = [...intentions, { id: Date.now(), text: inputValue.trim() }];
        saveIntentions(newIntentions);
        setInputValue('');
    };

    const handleDelete = (id) => {
        const newIntentions = intentions.filter(i => i.id !== id);
        saveIntentions(newIntentions);
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 h-full flex flex-col">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                <span className="material-symbols-outlined text-sm">favorite</span>
                <span className="text-xs font-bold uppercase tracking-wider">Libro de Intenciones</span>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Agregar petición..."
                    className="flex-1 bg-gray-50 dark:bg-black/20 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                    type="submit"
                    className="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                    disabled={!inputValue.trim()}
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </form>

            <div className="flex-1 overflow-y-auto min-h-[120px] pr-2 space-y-2">
                {intentions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined text-2xl mb-1">sentiment_satisfied</span>
                        <span className="text-xs">Sin peticiones</span>
                    </div>
                ) : (
                    intentions.map(item => (
                        <div key={item.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
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
