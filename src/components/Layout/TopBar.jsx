import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
// import { useAuth } from '../../context/AuthContext'; // Removed
import { useState } from 'react';
// import MobileMenuOverlay from './MobileMenuOverlay'; // Removed
// import MobileBottomNav from './MobileBottomNav'; // Replaced by GooeyNav
import GooeyNav from './GooeyNav';
import JerusalemCross from '../UI/JerusalemCross';

export default function TopBar({ date, onSettings, onProfile, activeTab, onNavigate, userRole, checkPermission, canGoBack, onBack }) {
    const { theme, setTheme } = useTheme();
    // Auth context no longer needed here for role switching (moved to profile)
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    // Full List for Desktop & Grid
    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Inicio', permission: null },
        { id: 'ai_chat', icon: 'smart_toy', label: 'Asistente', permission: null }, // AI Chat Item
        { id: 'calendar', icon: 'calendar_month', label: 'Calendario', permission: 'view_calendar' },
        { id: 'sacristy', icon: 'inventory_2', label: 'Sacristía', permission: 'view_sacristy' },
        { id: 'generator', icon: 'menu_book', label: 'Liturgia', permission: 'view_liturgy' },
        { id: 'music', icon: 'music_note', label: 'Cantoral', permission: 'view_music' },
        { id: 'directory', icon: 'diversity_3', label: 'Fieles', permission: 'view_directory' },
        { id: 'roster', icon: 'assignment_ind', label: 'Roles', permission: 'manage_roster' },
        { id: 'offerings', icon: 'volunteer_activism', label: 'Ofrenda', permission: 'view_offerings' },
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
                            <div className="flex flex-col items-center justify-center w-full py-1 animate-fade-in">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                                <div className="flex items-center justify-center gap-3 w-full">
                                    <JerusalemCross className="w-10 h-10 text-[#991b1b] shrink-0" />
                                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-display whitespace-nowrap">
                                        LITÚRG-<span style={{ color: '#991b1b' }}>IA /CG</span>
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP HEADER (Original) */}
                    <div className="hidden md:flex items-center justify-center text-center w-full">
                        <div className="flex flex-col shrink-0 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 capitalize opacity-80">{dateStr}</span>
                            <div className="flex items-center gap-3">
                                <JerusalemCross className="w-8 h-8 text-[#991b1b]" />
                                <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                                    LITÚRG-<span style={{ color: '#991b1b' }}>IA /CG</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- NAVIGATION: DESKTOP BOTTOM DOCK & MOBILE EDGE PANEL --- */}

            {/* DESKTOP: BOTTOM SQUIRCLE DOCK (Unchanged) */}
            <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                {/* SVG Definitions for Squircle Shape */}
                <svg width={0} height={0} style={{ position: 'absolute' }}>
                    <defs>
                        <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
                            <path d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5" />
                        </clipPath>
                    </defs>
                </svg>

                <div className="relative">
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl scale-105" />

                    <div className="relative flex items-end gap-x-2 p-2.5">
                        {visibleNavItems.map((item) => (
                            <NavItem key={item.id} item={item} activeTab={activeTab} onNavigate={onNavigate} />
                        ))}
                        {/* Profile Button */}
                        <button
                            onClick={onProfile}
                            className="relative group transition-all duration-300 ease-out active:scale-95 shrink-0 ml-2"
                            title="Mi Perfil"
                        >
                            <div
                                style={{ clipPath: 'url(#squircleClip)' }}
                                className="w-14 h-14 bg-stone-900 dark:bg-stone-100 flex items-center justify-center shadow-lg border border-stone-800 dark:border-stone-200 text-red-600 dark:text-red-700 hover:scale-110 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-3xl font-variation-settings-fill">account_circle</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE: GOOEY RADIAL MENU (User Requested) */}
            <GooeyNav
                navItems={visibleNavItems}
                onNavigate={onNavigate}
                activeTab={activeTab}
                onProfile={onProfile}
            />
        </>
    );
}

// --- SUB-COMPONENTS ---

function NavItem({ item, activeTab, onNavigate }) {
    const isActive = activeTab === item.id;
    const activeGradient = "bg-gradient-to-br from-red-600 to-red-800";
    const inactiveGradient = "bg-white dark:bg-gray-800/80";

    return (
        <button
            onClick={() => onNavigate(item.id)}
            className="relative group transition-all duration-300 ease-out active:scale-95"
            title={item.label}
        >
            <div
                style={{ clipPath: 'url(#squircleClip)' }}
                className={`w-12 h-12 md:w-12 md:h-12 flex items-center justify-center shadow-lg border transition-all duration-300
                    ${isActive
                        ? `${activeGradient} border-red-500/50 text-white scale-110 -translate-y-1`
                        : `${inactiveGradient} border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-400 hover:scale-105`
                    }`}
            >
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-variation-settings-fill' : ''}`}>
                    {item.icon}
                </span>
            </div>
            {isActive && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none md:block hidden">
                    {item.label}
                </span>
            )}
        </button>
    );
}




// --- SUB-COMPONENTS ---

function MobileEdgePanel({ isOpen, setIsOpen, navItems, activeTab, onNavigate, onProfile }) {
    return (
        <div className="md:hidden fixed inset-y-0 right-0 z-[100] pointer-events-none flex items-center">

            {/* OVERLAY (Click to close) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* HANDLE (Visible when closed) */}
            <div
                className={`pointer-events-auto absolute right-0 transition-transform duration-300 ease-out 
                    ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                `}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-48 w-1.5 bg-red-600/90 dark:bg-red-500/90 backdrop-blur-md rounded-l-full shadow-[0_0_15px_rgba(153,27,27,0.5)] border-l border-white/30 active:scale-95 transition-all hover:w-2"
                />
            </div>

            {/* PANEL CONTENT */}
            <div
                className={`pointer-events-auto relative h-[85vh] w-20 bg-white/90 dark:bg-black/80 backdrop-blur-3xl rounded-l-3xl border-y border-l border-white/20 dark:border-white/10 shadow-2xl flex flex-col items-center py-6 gap-4 transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Scrollable Icons */}
                <div className="flex-1 overflow-y-auto no-scrollbar w-full flex flex-col items-center gap-4 pb-4">
                    {navItems.map((item) => (
                        <NavItem key={item.id} item={item} activeTab={activeTab} onNavigate={(id) => {
                            onNavigate(id);
                            setIsOpen(false); // Close on selection
                        }} />
                    ))}
                </div>

                {/* Separator */}
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-700 shrink-0" />

                {/* Profile Button */}
                <button
                    onClick={() => {
                        onProfile();
                        setIsOpen(false);
                    }}
                    className="shrink-0"
                >
                    <div
                        style={{ clipPath: 'url(#squircleClip)' }}
                        className="w-12 h-12 bg-stone-900 dark:bg-stone-100 flex items-center justify-center shadow-lg border border-stone-800 dark:border-stone-200 text-red-600 dark:text-red-700 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-2xl font-variation-settings-fill">account_circle</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
