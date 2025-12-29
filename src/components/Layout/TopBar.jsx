import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import MobileMenuOverlay from './MobileMenuOverlay';
import JerusalemCross from '../UI/JerusalemCross';

export default function TopBar({ date, onSettings, onProfile, activeTab, onNavigate, userRole, checkPermission, canGoBack, onBack }) {
    const { theme, setTheme } = useTheme();
    const { setPreviewRole, realRole } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    // Full List for Desktop & Grid
    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Inicio', permission: null },
        { id: 'calendar', icon: 'calendar_month', label: 'Calendario', permission: 'view_calendar' },
        { id: 'sacristy', icon: 'inventory_2', label: 'Sacristía', permission: 'view_sacristy' },
        { id: 'generator', icon: 'menu_book', label: 'Liturgia', permission: 'view_liturgy' },
        { id: 'music', icon: 'music_note', label: 'Cantoral', permission: 'view_music' },
        { id: 'directory', icon: 'diversity_3', label: 'Fieles', permission: 'view_directory' },
        { id: 'roster', icon: 'assignment_ind', label: 'Roles', permission: 'manage_roster' },
        { id: 'offerings', icon: 'savings', label: 'Ofrendas', permission: 'view_offerings' },
        { id: 'users', icon: 'manage_accounts', label: 'Usuarios', permission: 'manage_users' },
    ];

    const visibleNavItems = navItems.filter(item => {
        if (!item.permission) return true;
        return checkPermission && checkPermission(item.permission);
    });

    // Mobile Priority Items (Bottom Bar)
    const priorityItems = visibleNavItems.slice(0, 4); // First 4 items directly visible

    // Header Title Logic
    const activeItem = navItems.find(i => i.id === activeTab);
    const title = activeItem ? activeItem.label : 'App';

    return (
        <>
            <header className="sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-md px-4 pt-2 md:pt-4 pb-2 transition-colors duration-300 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto w-full">

                    {/* MOBILE DYNAMIC HEADER */}
                    <div className="flex md:hidden items-center w-full">
                        {canGoBack ? (
                            // MODE 1: Back Button & Title
                            <div className="flex items-center w-full animate-fade-in gap-3">
                                <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/10">
                                    <span className="material-symbols-outlined text-2xl text-stone-800 dark:text-white">arrow_back</span>
                                </button>
                                <h1 className="text-lg font-bold text-stone-900 dark:text-white">{title}</h1>
                            </div>
                        ) : (
                            // MODE 2: Standard Brand Text Only (No Icons)
                            <div className="flex items-center justify-center w-full py-2 animate-fade-in gap-2">
                                <JerusalemCross className="w-6 h-6 text-[#991b1b]" />
                                <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                                    LITÚRG-<span style={{ color: '#991b1b' }}>IA</span>
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP HEADER (Original) */}
                    <div className="hidden md:flex items-center justify-between w-full">
                        <div className="flex flex-col shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                            <div className="flex items-center gap-3">
                                <JerusalemCross className="w-8 h-8 text-[#991b1b]" />
                                <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                                    LITÚRG-<span style={{ color: '#991b1b' }}>IA /CG</span>
                                </h1>
                            </div>
                        </div>

                        <nav className="flex items-center gap-4">
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
                                    <span className="text-xs hidden lg:block">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            {/* DESKTOP ADMIN SWITCHER */}
                            {realRole === 'admin' && (
                                <div className="relative group">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all ${userRole ? 'bg-red-50 text-red-800' : 'neumorphic-btn'}`}>
                                        <span className={`material-symbols-outlined text-lg ${userRole ? 'text-red-500' : 'text-gray-400'}`}>
                                            {userRole ? 'admin_panel_settings' : 'visibility'}
                                        </span>
                                        <span className="text-xs font-bold uppercase hidden xl:block">
                                            {userRole ? 'Supervisando' : 'Vista Real'}
                                        </span>
                                        {/* Invisible Select overlay for simplicity */}
                                        <select
                                            value={userRole || 'admin'}
                                            onChange={(e) => {
                                                const newRole = e.target.value === 'admin' ? null : e.target.value;
                                                setPreviewRole(newRole);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            <option value="admin">Ver como Director (Admin)</option>
                                            <option disabled>--- VISTAS DE EQUIPO ---</option>
                                            <option value="sacristan">Vista: Sacristán</option>
                                            <option value="treasurer">Vista: Tesorero</option>
                                            <option value="secretary">Vista: Secretario</option>
                                            <option value="musician">Vista: Músico</option>
                                            <option value="acolyte">Vista: Acólito</option>
                                            <option disabled>--- VISTAS PÚBLICAS ---</option>
                                            <option value="reader">Vista: Lector</option>
                                            <option value="guest">Vista: Feligrés</option>
                                        </select>
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        Cambiar Rol
                                    </div>
                                </div>
                            )}

                            <button onClick={onProfile} className="w-10 h-10 neumorphic-btn" title="Mi Perfil">
                                <span className="material-symbols-outlined">account_circle</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE BOTTOM NAVIGATION (Redesigned) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-safe-area pt-1 px-4 flex justify-between items-center z-40 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
                    {priorityItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all active:scale-90 ${activeTab === item.id ? 'text-primary' : 'text-stone-400'}`}
                        >
                            <span className={`material-symbols-outlined text-[26px] ${activeTab === item.id ? 'font-variation-settings-fill' : ''} transition-all duration-300`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-medium transition-all duration-300 ${activeTab === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0 h-0'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}

                    {/* MENU TAB (FAB-like) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-stone-400 active:text-primary active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[26px]">apps</span>
                        <span className="text-[10px] font-medium">Menú</span>
                    </button>
                </nav>
            </header>

            {/* FULL GRID MENU OVERLAY */}
            <MobileMenuOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate}
                onProfile={onProfile}
                visibleNavItems={visibleNavItems}
                activeTab={activeTab}

                // Pass Role Props for Admin Switcher in Menu
                realRole={realRole}
                userRole={userRole}
                setPreviewRole={setPreviewRole}
            />
        </>
    );
}
