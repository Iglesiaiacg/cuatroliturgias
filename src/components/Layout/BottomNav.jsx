export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="w-full glass-nav pb-safe pt-2 px-6 z-50 shrink-0">
            <div className="flex justify-between items-center max-w-md mx-auto h-16">
                <button
                    onClick={() => onTabChange('dashboard')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[28px] font-variation-settings-fill transition-transform group-active:scale-90">home</span>
                    <span className="text-[10px] font-medium">Inicio</span>
                </button>
                <button
                    onClick={() => onTabChange('calendar')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === 'calendar' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-90">calendar_month</span>
                    <span className="text-[10px] font-medium">Calendario</span>
                </button>
                <button
                    onClick={() => onTabChange('favorites')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === 'favorites' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-90">favorite</span>
                    <span className="text-[10px] font-medium">Favoritos</span>
                </button>
                <button
                    onClick={() => onTabChange('generator')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === 'generator' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-90">menu_book</span>
                    <span className="text-[10px] font-medium">Liturgia</span>
                </button>
            </div>
            {/* Safe area spacing for iOS Home Indicator */}
            <div className="h-6 w-full"></div>
        </nav>
    );
}
