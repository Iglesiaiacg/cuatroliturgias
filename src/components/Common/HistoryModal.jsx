import { useState, useEffect } from 'react';
import { getHistory } from '../../services/storage';
import { db, auth } from '../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { createPortal } from 'react-dom';

export default function HistoryModal({ isOpen, onClose, onRestore }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                // 1. Local fallback
                const local = getHistory();

                // 2. Cloud if logged in
                if (auth.currentUser) {
                    const q = query(
                        collection(db, 'liturgies'),
                        where('userId', '==', auth.currentUser.uid),
                        orderBy('createdAt', 'desc'),
                        limit(10)
                    );
                    const snapshot = await getDocs(q);
                    const cloudDocs = snapshot.docs.map(d => ({
                        id: d.id,
                        ...d.data(),
                        // standardize date for UI
                        date: d.data().date?.toDate ? d.data().date.toDate().toISOString() : d.data().date
                    }));
                    setHistory(cloudDocs); // Prefer cloud
                } else {
                    setHistory(local);
                }
            } catch (e) {
                console.error("Error fetching history", e);
                // Fallback to local on error
                setHistory(getHistory());
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="bg-white dark:bg-surface-dark rounded-[20px] shadow-2xl w-full max-w-md z-50 overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col max-h-[80vh] border border-gray-100 dark:border-white/5">

                {/* Header */}
                <div className="p-5 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-surface-dark sticky top-0">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Historial Reciente</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>

                {/* List */}
                <div className="p-2 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No hay historial reciente.</p>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onRestore(item)}
                                className="p-4 m-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all group"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-red-100/50 px-2 py-0.5 rounded-md group-hover:bg-white/80 transition-colors">
                                        {item.tradition}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-900 dark:group-hover:text-red-300 transition-colors">
                                    {item.title}
                                </h4>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-black/20 text-center border-t border-gray-100 dark:border-white/5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Se guardan los últimos 5</p>
                </div>
            </div>
        </div>,
        document.body
    );
}
