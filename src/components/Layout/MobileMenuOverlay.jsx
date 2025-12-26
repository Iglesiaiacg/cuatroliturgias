import React, { useEffect, useState } from 'react';

export default function MobileMenuOverlay({ isOpen, onClose, onNavigate, visibleNavItems, activeTab }) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            const timer = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !animate) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Bottom Sheet Card */}
            <div className={`relative bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl p-6 pb-safe-area transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>

                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-stone-700 rounded-full mx-auto mb-6" />

                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6 px-2">Menú Principal</h3>

                <div className="grid grid-cols-4 gap-4">
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onNavigate(item.id);
                                onClose();
                            }}
                            className={`flex flex-col items-center gap-2 p-2 rounded-2xl active:scale-95 transition-transform ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${activeTab === item.id
                                ? 'bg-primary text-white shadow-primary/30'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-gray-100 dark:border-stone-700'}`}>
                                <span className={`material-symbols-outlined ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium text-center leading-tight truncate w-full text-stone-600 dark:text-stone-400">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-3 bg-gray-100 dark:bg-stone-800 rounded-xl text-sm font-bold text-stone-600 dark:text-stone-300"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
