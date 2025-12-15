import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const bgClass = type === 'error' ? 'bg-red-500' : 'bg-gray-800';

    return (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all animate-slide-in-right ${bgClass}`}>
            <span className="text-xl">{type === 'error' ? '⚠️' : '✅'}</span>
            <p className="font-bold text-sm tracking-wide">{message}</p>
        </div>
    );
}
