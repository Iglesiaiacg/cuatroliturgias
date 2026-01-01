import React from 'react';

export default function MobileBottomNav({ navItems, activeTab, onNavigate, onProfile }) {
    // We only want to show the most important items to avoid clutter
    // Priority: Home (Dashboard), Calendar, Sacristy (for staff), Music (for musicians/all)
    // We can show up to 5 items comfortably.

    // Filter items to show on the bottom bar
    const priorityItems = navItems.filter(item =>
        ['dashboard', 'calendar', 'sacristy', 'music', 'offerings'].includes(item.id)
    ).slice(0, 4); // Limit to 4 to leave room for Profile

    return (
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

                {/* Profile / Menu Item */}
                <button
                    onClick={onProfile}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 dark:text-gray-500"
                >
                    <div className="w-[26px] h-[26px] rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <span className="text-[10px] font-medium tracking-tight">
                        Perfil
                    </span>
                </button>
            </div>
        </div>
    );
}
