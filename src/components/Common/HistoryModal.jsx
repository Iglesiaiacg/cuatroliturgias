import { useEffect, useState } from 'react';
import { getHistory } from '../../services/storage';

export default function HistoryModal({ isOpen, onClose, onRestore }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setHistory(getHistory());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md z-50 overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-5 border-b border-gray-200/50 flex justify-between items-center bg-white sticky top-0">
                    <h3 className="font-bold text-gray-700 text-lg">Historial Reciente</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>

                {/* List */}
                <div className="p-2 overflow-y-auto flex-1">
                    {history.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No hay historial reciente.</p>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onRestore(item)}
                                className="p-4 m-2 rounded-xl hover:bg-teal-50 cursor-pointer border border-transparent hover:border-teal-100 transition-all group"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100/50 px-2 py-0.5 rounded-md group-hover:bg-white/80 transition-colors">
                                        {item.tradition}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-700 group-hover:text-teal-900 transition-colors">
                                    {item.title}
                                </h4>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Se guardan los últimos 5</p>
                </div>
            </div>
        </div>
    );
}
