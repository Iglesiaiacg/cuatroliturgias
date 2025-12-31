import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext'; // NEW: Auth Hook
import Preview from '../Liturgy/Preview';

// Common Components
import StyledCard from '../Common/StyledCard';
import NextLiturgyCard from '../Dashboard/NextLiturgyCard';
import FinanceCard from '../Dashboard/FinanceCard';
import RolesCard from '../Dashboard/RolesCard';
import IntentionsCard from '../Dashboard/IntentionsCard';
import StatsCard from '../Dashboard/StatsCard';
import NoticesCard from '../Dashboard/NoticesCard';
import QuickCertCard from '../Dashboard/QuickCertCard';
import SacristyStatusCard from '../Dashboard/SacristyStatusCard';
import SundaySummaryCard from '../Dashboard/SundaySummaryCard'; // NEW

// Role Dashboards
import { TreasurerDashboard, SacristanDashboard, SecretaryDashboard, MusicianDashboard, AcolyteDashboard } from '../Dashboard/RoleDashboards';
import GuestDashboard from '../Dashboard/GuestDashboard';
import CommunicationCenter from '../Dashboard/CommunicationCenter';

export default function HomeView({ onNavigate, date, docContent, season, calculatedFeast }) {
    const { userRole, checkPermission } = useAuth(); // Get current role
    const [pinnedLiturgy, setPinnedLiturgy] = useState(null);
    const [isReadingPinned, setIsReadingPinned] = useState(false);
    const [isCommOpen, setIsCommOpen] = useState(false);

    // CELEBRANT MODE LOGIC
    const [isSundayLive, setIsSundayLive] = useState(false);
    // If it's Sunday Live time, default to Celebrant Mode (Admin Hidden). Else Admin Mode.
    const [showAdminDashboard, setShowAdminDashboard] = useState(true);

    useEffect(() => {
        const now = new Date();
        const isSunday = now.getDay() === 0;
        const hour = now.getHours();
        const isLive = isSunday && hour >= 7 && hour < 15; // 7am to 3pm wide window
        setIsSundayLive(isLive);

        // Auto-switch to Celebrant Mode on Sunday Morning
        if (isLive) {
            setShowAdminDashboard(false);
        } else {
            setShowAdminDashboard(true);
        }
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'config', 'pinned_liturgy'), (doc) => {
            if (doc.exists()) {
                setPinnedLiturgy(doc.data());
            } else {
                setPinnedLiturgy(null);
            }
        }, (error) => {
            console.error("Error fetching pinned liturgy:", error);
        });
        return () => unsub();
    }, []);

    // --- RENDER LOGIC BASED ON ROLE ---

    // 1. ACOLYTE (Simplified View)
    if (userRole === 'acolyte') {
        const displayLiturgy = pinnedLiturgy || { title: calculatedFeast, content: docContent };
        return <AcolyteDashboard pinnedLiturgy={displayLiturgy} />;
    }

    // 2. TREASURER
    if (userRole === 'treasurer') {
        return <TreasurerDashboard onNavigate={onNavigate} docContent={docContent} />;
    }

    // 3. SACRISTAN
    if (userRole === 'sacristan') {
        return <SacristanDashboard onNavigate={onNavigate} date={date} docContent={docContent} season={season} />;
    }

    // 4. SECRETARY
    if (userRole === 'secretary') {
        return <SecretaryDashboard onNavigate={onNavigate} date={date} docContent={docContent} />;
    }

    // 5. MUSICIAN
    if (userRole === 'musician') {
        return <MusicianDashboard onNavigate={onNavigate} docContent={docContent} calculatedFeast={calculatedFeast} />;
    }

    // 6. GUEST / FAITHFUL (Devotional View)
    if (userRole === 'guest' || userRole === 'reader') {
        return <GuestDashboard onNavigate={onNavigate} pinnedLiturgy={pinnedLiturgy} date={date} />;
    }

    // 7. ADMIN / PRIEST (Context-Aware Dashboard)
    return (
        <main className="flex-1 flex flex-col px-4 pt-6 space-y-8 w-full max-w-7xl mx-auto animate-fade-in pb-32">

            {/* Communication Center Modal */}
            {isCommOpen && <CommunicationCenter onClose={() => setIsCommOpen(false)} />}

            {/* Greeting Header & Mode Switcher */}
            <div className="mb-2 md:text-center flex flex-col md:items-center">
                <div className="flex justify-between items-center w-full md:justify-center md:flex-col md:gap-2">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                            {(() => {
                                const hour = new Date().getHours();
                                if (hour < 12) return "Buenos días";
                                if (hour < 20) return "Buenas tardes";
                                return "Buenas noches";
                            })()}, <span className="text-primary">Padre</span>.
                        </h1>
                        <p className="text-gray-600 dark:text-gray-500">
                            {date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(date) : 'Bienvenido'}
                        </p>
                    </div>

                    {/* Mode Toggle Button */}
                    <button
                        onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-2
                        ${!showAdminDashboard
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/10'}`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {!showAdminDashboard ? 'church' : 'dashboard'}
                        </span>
                        {!showAdminDashboard ? 'Modo Celebrante' : 'Modo Director'}
                    </button>
                </div>
            </div>

            {/* PINNED LITURGY SECTION (Takes Priority) */}
            {pinnedLiturgy && !isReadingPinned && (
                (() => {
                    const now = new Date();
                    const isSunday = now.getDay() === 0;
                    const hour = now.getHours();
                    // Active Sunday Window: 8:00 AM to 1:00 PM (13:00)
                    const isLive = isSunday && hour >= 8 && hour < 14;

                    return (
                        <div className={`rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden group transition-all duration-500
                            ${isLive
                                ? 'bg-gradient-to-r from-red-900 to-red-800 text-white scan-line-effect'
                                : 'bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
                            }`}>

                            {/* Visual Pulse Effect (Only when Live) */}
                            {isLive && <div className="absolute top-0 right-0 m-4 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>}

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border 
                                            ${isLive
                                                ? 'bg-red-500/30 text-red-100 border-red-400/30'
                                                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                            }`}>
                                            {isLive ? 'En Curso' : 'Próxima Misa'}
                                        </span>
                                        <span className={`text-xs flex items-center gap-1 ${isLive ? 'text-red-200' : 'text-gray-400'}`}>
                                            <span className="material-symbols-outlined text-[14px]">push_pin</span>
                                            Fijado por ti
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-display font-bold mb-1 leading-tight capitalize">
                                        {(() => {
                                            if (!pinnedLiturgy.date) return pinnedLiturgy.title || "Santa Eucaristía";
                                            const lDate = new Date(pinnedLiturgy.date.seconds * 1000);
                                            // If it's a Sunday, show formatted date. Else, show title (e.g., Jueves Santo).
                                            if (lDate.getDay() === 0) {
                                                const options = { weekday: 'long', day: 'numeric', month: 'long' };
                                                const dateStr = lDate.toLocaleDateString('es-MX', options);
                                                // Ensure capitalization
                                                return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                                            }
                                            return pinnedLiturgy.title;
                                        })()}
                                    </h2>
                                    <p className={`text-sm opacity-90 ${isLive ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {pinnedLiturgy.date && new Date(pinnedLiturgy.date.seconds * 1000).getDay() === 0
                                            ? (pinnedLiturgy.title || "Santa Misa")
                                            : (pinnedLiturgy.date ? new Date(pinnedLiturgy.date.seconds * 1000).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoy')}
                                    </p>
                                </div>
                                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                    {/* Action Buttons: Visible ONLY on Saturday (Preparation) & Sunday (Service) */}
                                    {(isSunday || (now.getDay() === 6)) && (
                                        <>
                                            <button
                                                onClick={() => setIsReadingPinned(true)}
                                                className={`w-full md:w-auto px-6 py-4 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3
                                                    ${isLive
                                                        ? 'bg-white text-red-900 hover:bg-gray-100'
                                                        : 'bg-primary text-white hover:bg-red-700 shadow-red-500/20'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-2xl">menu_book</span>
                                                <span className="text-lg">{isLive ? 'ABRIR MISAL' : 'Revisar Guion'}</span>
                                            </button>
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => window.print()}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                                                        ${isLive
                                                            ? 'bg-white/50 hover:bg-white/80 text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-gray-300'
                                                        }`}
                                                    title="Imprimir para el Altar"
                                                >
                                                    <span className="material-symbols-outlined text-sm">print</span>
                                                    <span className="hidden sm:inline">Imprimir</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}

            {/* FULL SCREEN READER MODE */}
            {isReadingPinned && pinnedLiturgy && (
                <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-slide-in">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Leyendo</span>
                            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{pinnedLiturgy.title}</span>
                        </div>
                        <button
                            onClick={() => setIsReadingPinned(false)}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
                        <Preview content={pinnedLiturgy.content} rubricLevel={pinnedLiturgy.rubricLevel || 'simple'} />
                    </div>
                </div>
            )}


            {/* Dashboard Grid */}
            <div className={`grid grid-cols-1 ${!showAdminDashboard ? 'lg:grid-cols-2 max-w-5xl mx-auto' : 'lg:grid-cols-3'} gap-6 pb-8`}>

                {/* Column 1: Priority & Devotion (ALWAYS VISIBLE - But simplified if Celebrant) */}
                <div className="space-y-6">
                    {/* Next Liturgy (If no pinned event or just strictly next) */}
                    {!pinnedLiturgy && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Próxima Celebración</h3>
                            <NextLiturgyCard onClick={() => onNavigate('generator')} />
                        </section>
                    )}

                    {/* Intentions - Critical for Mass */}
                    <section>
                        <IntentionsCard date={date} />
                    </section>

                    {/* Notices - Critical for Mass Announcements */}
                    <section>
                        <NoticesCard />
                    </section>

                    {/* Access to Tools (Hidden in simple mode unless needed, but shortcuts are handy) */}
                    {showAdminDashboard && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Accesos Directos</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <StyledCard
                                    title="Liturgia"
                                    description="Generador"
                                    icon="menu_book"
                                    onClick={() => onNavigate('generator')}
                                    actionText="Ir"
                                    compact={true}
                                />
                                <StyledCard
                                    title="Servicios"
                                    description="Ocasionales"
                                    icon="church"
                                    onClick={() => onNavigate('occasional')}
                                    actionText="Ir"
                                    compact={true}
                                />
                            </div>
                        </section>
                    )}
                </div>

                {/* CELEBRANT MODE: Secondary Column (Summary) */}
                {!showAdminDashboard && (
                    <div className="space-y-6 animate-fade-in">
                        <SundaySummaryCard />

                        {/* Quick link to full dashboard if they need deep access */}
                        <div className="text-center pt-8 opacity-50 hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setShowAdminDashboard(true)}
                                className="text-xs text-gray-500 font-bold underline"
                            >
                                Necesito gestionar algo más...
                            </button>
                        </div>
                    </div>
                )}


                {/* ADMIN MODE: Columns 2 & 3 */}
                {showAdminDashboard && (
                    <>
                        {/* Column 2: Management & Communication */}
                        <div className="space-y-6 animate-fade-in">
                            <section>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Gestión Pastoral</h3>

                                {/* COMMUNICATION CENTER BUTTON (ADMIN ONLY) */}
                                {(userRole === 'admin' || (checkPermission && checkPermission('manage_communication'))) && (
                                    <button
                                        onClick={() => setIsCommOpen(true)}
                                        className="w-full mb-4 neumorphic-card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-stone-50 dark:from-red-900/10 dark:to-stone-900/10 border border-red-100 dark:border-red-800 hover:scale-[1.02] transition-transform"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                                            <span className="material-symbols-outlined text-2xl">forum</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-800 dark:text-white">Centro de Comunicaciones</h3>
                                            <p className="text-xs text-red-600 dark:text-red-300 font-medium">Avisos, Mensajes y Chat</p>
                                        </div>
                                        <span className="material-symbols-outlined text-red-300 ml-auto">open_in_new</span>
                                    </button>
                                )}

                                <RolesCard docContent={pinnedLiturgy ? pinnedLiturgy.content : null} />
                            </section>
                        </div>

                        {/* Column 3: Administration & Stats */}
                        <div className="space-y-6 animate-fade-in">
                            <section>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Sacristía</h3>
                                <SacristyStatusCard date={date} />
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Administración</h3>
                                <FinanceCard />
                            </section>

                            <section>
                                <StatsCard />
                            </section>

                            <section>
                                <QuickCertCard />
                            </section>
                        </div>
                    </>
                )}

            </div>
        </main>
    );
}
