import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import logoHome from '../../assets/logo.png';

export default function TopBar({ date, onSettings, activeTab, onNavigate }) {
    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Inicio' },
        { id: 'calendar', icon: 'calendar_month', label: 'Calendario' },
        { id: 'directory', icon: 'diversity_3', label: 'Fieles' },
        { id: 'offerings', icon: 'savings', label: 'Ofrendas' },
        { id: 'sacristy', icon: 'inventory_2', label: 'Sacristía' },
        { id: 'generator', icon: 'menu_book', label: 'Liturgia' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 pt-4 pb-2 transition-colors duration-300">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                {/* 1. Logo & Date */}
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                    <div className="flex items-center gap-3">
                        <img src={logoHome} alt="Liturgia Logo" className="h-8 w-auto object-contain hidden sm:block" />
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
                            LITÚRG-<span style={{ color: '#991b1b' }}>IA /CG</span>
                        </h1>
                    </div>
                </div>

                {/* 2. Navigation (Center) - Desktop & Tablet */}
                <nav className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-white/5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeTab === item.id
                                ? 'bg-white dark:bg-white/10 text-primary shadow-sm font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5 font-medium'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-xs">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* 3. Settings */}
                <button
                    onClick={onSettings}
                    aria-label="Configuración"
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shrink-0"
                >
                    <span className="material-symbols-outlined text-gray-900 dark:text-white" style={{ fontSize: '24px' }}>settings</span>
                </button>
            </div>

            {/* Mobile Navigation (Bottom row of header) */}
            <nav className="md:hidden flex justify-around items-center pt-4 pb-1 border-t border-gray-100 dark:border-white/5 mt-3">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === item.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <span className={`material-symbols-outlined text-[24px] transition-transform group-active:scale-90 ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                            {item.icon}
                        </span>
                        {/* <span className="text-[9px] font-medium">{item.label}</span>  Optional on mobile to save space */}
                    </button>
                ))}
            </nav>
        </header>
    );
}
