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
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
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
                        <div className="hidden lg:flex items-center bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1 mr-2 border border-red-100 dark:border-red-800/30">
                            <span className="material-symbols-outlined text-red-400 text-sm mr-2">visibility</span>
                            <select
                                value={propRole || 'admin'}
                                onChange={(e) => {
                                    const newRole = e.target.value === 'admin' ? null : e.target.value; // null resets to real role
                                    setPreviewRole(newRole);
                                    if (onNavigate) onNavigate('dashboard'); // Reset view to home
                                }}
                                className="bg-transparent text-xs font-bold text-red-800 dark:text-red-200 outline-none cursor-pointer border-none focus:ring-0 w-32"
                            >
                                <option value="admin">Modo Rector</option>
                                <option value="treasurer">Ver: Tesorero</option>
                                <option value="sacristan">Ver: Sacristán</option>
                                <option value="secretary">Ver: Secretaría</option>
                                <option value="musician">Ver: Músico</option>
                                <option value="acolyte">Ver: Acólito</option>
                                <option value="guest">Ver: Fiel</option>
                            </select>
                        </div>
                    )}

                    {/* ADMIN VIEW SWITCHER */}
                    {checkPermission('manage_users') && (
                        <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1 mr-2 border border-gray-200 dark:border-white/10">
                            <span className="material-symbols-outlined text-gray-500 text-sm mr-2">visibility</span>
                            <select
                                value={userRole}
                                onChange={(e) => {
                                    if (onNavigate) onNavigate('dashboard'); // Go home when switching to see effect
                                    // We access context directly via hook inside component usually, but here props passed?
                                    // Wait, TopBar receives userRole prop. We should probably use the hook inside TopBar if possible or pass setPreviewRole.
                                    // Let's rely on the hook since we imported it below (I need to add import to file top or assume it's passed).
                                    // Actually, TopBar props list has userRole. Let's assume we need to use the hook.
                                }}
                                className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                            >
                                <option value="admin">Vista: Rector</option>
                                <option value="treasurer">Vista: Tesorero</option>
                                <option value="sacristan">Vista: Sacristán</option>
                                <option value="secretary">Vista: Secretaría</option>
                                <option value="musician">Vista: Músico</option>
                                <option value="acolyte">Vista: Acólito</option>
                                <option value="guest">Vista: Fiel</option>
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

            {/* Mobile Navigation (Bottom row of header) */}
            <nav className="md:hidden flex justify-around items-center pt-4 pb-1 border-t border-stone-200 dark:border-stone-800 mt-3">
                {visibleNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 group ${activeTab === item.id ? 'text-primary' : 'text-stone-500 dark:text-stone-400'}`}
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
