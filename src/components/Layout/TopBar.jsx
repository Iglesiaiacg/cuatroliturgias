import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
// import { useAuth } from '../../context/AuthContext'; // Removed
import { useState } from 'react';
import MobileMenuOverlay from './MobileMenuOverlay';
import JerusalemCross from '../UI/JerusalemCross';

export default function TopBar({ date, onSettings, onProfile, activeTab, onNavigate, userRole, checkPermission, canGoBack, onBack }) {
    const { theme, setTheme } = useTheme();
    // Auth context no longer needed here for role switching (moved to profile)
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



                        <div className="flex items-center gap-3">
                            {/* Role Switcher Removed - Moved to Profile Settings */}

                            <button onClick={onProfile} className="w-10 h-10 neumorphic-btn" title="Mi Perfil">
                                <span className="material-symbols-outlined">account_circle</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RESPONSIVE SQUIRCLE DOCK NAVIGATION */}
                <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw]">
                    {/* SVG Definitions for Squircle Shape */}
                    <svg width={0} height={0} style={{ position: 'absolute' }}>
                        <defs>
                            <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
                                <path d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5" />
                            </clipPath>
                        </defs>
                    </svg>

                    <div className="relative">
                        {/* Glass Background Container */}
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl scale-105" />

                        <div className="relative flex items-end gap-x-2 p-2.5 overflow-x-auto no-scrollbar touch-pan-x">
                            {/* Desktop: Show All | Mobile: Show Priority Only */}
                            {(typeof window !== 'undefined' && window.innerWidth >= 768 ? visibleNavItems : priorityItems).map((item, index) => {
                                const isActive = activeTab === item.id;
                                // Gradients for active state vs inactive
                                const activeGradient = "bg-gradient-to-br from-red-600 to-red-800";
                                const inactiveGradient = "bg-white dark:bg-gray-800/80";

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className="relative group transition-all duration-300 ease-out active:scale-95"
                                        title={item.label}
                                    >
                                        <div
                                            style={{ clipPath: 'url(#squircleClip)' }}
                                            className={`w-12 h-12 flex items-center justify-center shadow-lg border transition-all duration-300
                                                ${isActive
                                                    ? `${activeGradient} border-red-500/50 text-white scale-110 -translate-y-1`
                                                    : `${inactiveGradient} border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-400 hover:scale-105`
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-variation-settings-fill' : ''}`}>
                                                {item.icon}
                                            </span>
                                        </div>
                                        {/* Tooltip Label (Optional) */}
                                        {isActive && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            {/* MENU BUTTON (Mobile Only or Overflow) */}
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="relative group transition-all duration-300 ease-out active:scale-95 shrink-0 md:hidden"
                            >
                                <div
                                    style={{ clipPath: 'url(#squircleClip)' }}
                                    className="w-12 h-12 bg-white dark:bg-gray-800/80 flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105"
                                >
                                    <span className="material-symbols-outlined text-2xl">apps</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
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
                userRole={userRole}
            />
        </>
    );
}
