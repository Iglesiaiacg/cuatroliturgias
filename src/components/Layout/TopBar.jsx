import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext'; // Import hook
import logoHome from '../../assets/logo.png';

export default function TopBar({ date, onSettings, onProfile, activeTab, onNavigate, userRole, checkPermission }) {
    const { theme, setTheme } = useTheme();
    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Inicio', permission: null }, // Everyone needs home
        { id: 'calendar', icon: 'calendar_month', label: 'Calendario', permission: 'view_calendar' },
        { id: 'sacristy', icon: 'inventory_2', label: 'Sacristía', permission: 'view_sacristy' },
        { id: 'generator', icon: 'menu_book', label: 'Liturgia', permission: 'view_liturgy' },
        { id: 'music', icon: 'music_note', label: 'Cantoral', permission: 'view_music' },
        { id: 'directory', icon: 'diversity_3', label: 'Fieles', permission: 'view_directory' },
        { id: 'offerings', icon: 'savings', label: 'Ofrendas', permission: 'view_offerings' },
        { id: 'users', icon: 'manage_accounts', label: 'Usuarios', permission: 'manage_users' },
    ];

    // Filter items based on permission
    const visibleNavItems = navItems.filter(item => {
        if (!item.permission) return true;
        return checkPermission && checkPermission(item.permission);
    });

    return (
        <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-md border-b border-border-base px-4 pt-4 pb-2 transition-colors duration-300">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                {/* 1. Logo & Date */}
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                    <div className="flex items-center gap-3">
                        <img src={logoHome} alt="Liturgia Logo" className="h-8 w-auto object-contain hidden sm:block" />
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-txt-primary font-display">
                            LITÚRG-<span style={{ color: 'var(--color-primary)' }}>IA /CG</span>
                        </h1>
                    </div>
                </div>

                {/* 2. Navigation (Center) - Desktop & Tablet */}
                <nav className="hidden md:flex items-center bg-surface-highlight p-1 rounded-full border border-border-base">
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeTab === item.id
                                ? 'bg-surface text-primary shadow-sm font-bold'
                                : 'text-txt-secondary hover:text-txt-primary hover:bg-surface/50 font-medium'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-xs">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* 3. Settings & Profile */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-highlight transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-txt-primary">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button
                        onClick={onProfile}
                        aria-label="Mi Perfil"
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-highlight transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-txt-primary" style={{ fontSize: '24px' }}>account_circle</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation (Bottom row of header) */}
            <nav className="md:hidden flex justify-around items-center pt-4 pb-1 border-t border-border-base mt-3">
                {visibleNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === item.id ? 'text-primary' : 'text-txt-secondary'}`}
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
