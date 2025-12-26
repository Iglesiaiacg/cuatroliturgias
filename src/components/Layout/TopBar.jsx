import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext'; // Restoring hook

import { useAuth } from '../../context/AuthContext';

export default function TopBar({ date, onSettings, onProfile, activeTab, onNavigate, userRole: propRole, checkPermission }) {
    const { theme, setTheme } = useTheme();
    const { setPreviewRole, realRole } = useAuth(); // Hook access

    // Use propRole (which comes from App -> AuthContext value) or local context? 
    // App.jsx passes userRole={userRole}. Since we updated AuthContext to return effectiveRole as userRole, propRole IS the effective role.

    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Inicio', permission: null },
        { id: 'calendar', icon: 'calendar_month', label: 'Calendario', permission: 'view_calendar' },
        { id: 'sacristy', icon: 'inventory_2', label: 'Sacristía', permission: 'view_sacristy' },
        { id: 'generator', icon: 'menu_book', label: 'Liturgia', permission: 'generate_liturgy' },
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
        <header className="sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-md px-4 pt-4 pb-2 transition-colors duration-300 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                {/* 1. Logo & Date */}
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">church</span>
                        <h1 className="hidden md:block text-xl md:text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                            LITÚRG-<span style={{ color: '#991b1b' }}>IA /CG</span>
                        </h1>
                    </div>
                </div>

                {/* 2. Navigation (Center) - Desktop & Tablet */}
                <nav className="hidden md:flex items-center gap-4">
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`h-10 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${activeTab === item.id
                                ? 'neumorphic-inset font-bold text-primary shadow-inner'
                                : 'neumorphic-btn text-gray-500 hover:text-primary'}`}
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

                    {/* ADMIN VIEW SWITCHER - Only visible to Real Admins */}
                    {realRole === 'admin' && (
                        <div className="flex shrink-0 items-center bg-red-50 dark:bg-red-900/20 rounded-lg px-1 md:px-2 py-1 mr-1 md:mr-2 border border-red-100 dark:border-red-800/30">
                            <span className="material-symbols-outlined text-red-400 text-sm mr-1 hidden md:inline">visibility</span>
                            <select
                                value={propRole || 'admin'}
                                onChange={(e) => {
                                    const newRole = e.target.value === 'admin' ? null : e.target.value; // null resets to real role
                                    setPreviewRole(newRole);
                                    if (onNavigate) onNavigate('dashboard'); // Reset view to home
                                }}
                                className="bg-transparent text-[10px] md:text-xs font-bold text-red-800 dark:text-red-200 outline-none cursor-pointer border-none focus:ring-0 w-24 md:w-32 active:bg-red-100"
                            >
                                <option value="admin">Rector</option>
                                <option value="treasurer">Tesorero</option>
                                <option value="sacristan">Sacristán</option>
                                <option value="secretary">Secretaría</option>
                                <option value="musician">Músico</option>
                                <option value="acolyte">Acólito</option>
                                <option value="guest">Fiel</option>
                            </select>
                        </div>
                    )}







                    <button
                        onClick={onProfile}
                        aria-label="Mi Perfil"
                        className="w-10 h-10 neumorphic-btn"
                    >
                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-200" style={{ fontSize: '24px' }}>account_circle</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation (Fixed Bottom Bar) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-main)]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe-area pt-2 px-2 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {visibleNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all active:scale-95 ${activeTab === item.id ? 'text-primary' : 'text-stone-500 dark:text-stone-400'}`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${activeTab === item.id ? 'font-variation-settings-fill' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-medium truncate w-full text-center">{item.label}</span>
                    </button>
                ))}
            </nav>
        </header>
    );
}
