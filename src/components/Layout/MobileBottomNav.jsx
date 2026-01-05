import React, { useState } from 'react';

export default function MobileBottomNav({ navItems, activeTab, onNavigate, onProfile }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Default Priority Items for the Bar
    const priorityItems = navItems.filter(item =>
        ['dashboard', 'calendar', 'music', 'sacristy'].includes(item.id)
    ).slice(0, 4);

    // Items that are NOT in the priority list (Hidden Items)
    const hiddenItems = navItems.filter(item =>
        !['dashboard', 'calendar', 'music', 'sacristy'].includes(item.id)
    );

    const handleNavigate = (id) => {
        onNavigate(id);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* FULL MENU DRAWER */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-[#151515]/98 backdrop-blur-xl animate-fade-in flex flex-col safe-area-bottom">
                    {/* Header */}
                    <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                        <span className="text-lg font-display font-bold text-primary">Menú Principal</span>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* 1. Quick Profile Access */}
                        <div
                            onClick={() => { onProfile(); setIsMenuOpen(false); }}
                            className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Mi Perfil</h3>
                                <p className="text-xs text-gray-500">Ajustes y Cuenta</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-gray-400">chevron_right</span>
                        </div>

                        {/* 2. All Applications Grid */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Aplicaciones</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigate(item.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                                            ${activeTab === item.id
                                                ? 'bg-primary/10 text-primary ring-1 ring-primary'
                                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-3xl ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="text-[10px] font-bold text-center leading-tight">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTTOM NAV BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 pb-safe pt-2 px-6 safe-area-bottom">
                <div className="flex items-center justify-between">
                    {priorityItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 
                                    ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                            >
                                <span className={`material-symbols-outlined text-[26px] ${isActive ? 'font-variation-settings-fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-medium tracking-tight">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    {/* Menu Button (Replaces Profile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 
                            ${isMenuOpen ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <div className="w-[26px] h-[26px] rounded-full border border-current flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </div>
                        <span className="text-[10px] font-medium tracking-tight">
                            Menú
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
