import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Preview from '../Liturgy/Preview'; // Re-use preview for display? Or just a button to open?
// Better: Detailed Card that opens a Modal or expands. PROPOSAL: Expandable Card.

import StyledCard from '../Common/StyledCard';
import NextLiturgyCard from '../Dashboard/NextLiturgyCard';
import FinanceCard from '../Dashboard/FinanceCard';
import RolesCard from '../Dashboard/RolesCard';
import IntentionsCard from '../Dashboard/IntentionsCard';
import StatsCard from '../Dashboard/StatsCard';
import NoticesCard from '../Dashboard/NoticesCard';
import QuickCertCard from '../Dashboard/QuickCertCard';
import SacristyStatusCard from '../Dashboard/SacristyStatusCard';

export default function Dashboard({ onNavigate, date }) {
    const [pinnedLiturgy, setPinnedLiturgy] = useState(null);
    const [isReadingPinned, setIsReadingPinned] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'config', 'pinned_liturgy'), (doc) => {
            if (doc.exists()) {
                setPinnedLiturgy(doc.data());
            } else {
                setPinnedLiturgy(null);
            }
        });
        return () => unsub();
    }, []);

    return (
        <main className="flex-1 flex flex-col px-4 pt-6 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto animate-fade-in">


            {/* Greeting Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                    {(() => {
                        const hour = new Date().getHours();
                        if (hour < 12) return "Buenos días";
                        if (hour < 20) return "Buenas tardes";
                        return "Buenas noches";
                    })()},
                </h1>
                <div className="flex items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400">
                        {date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(date) : 'Bienvenido'}
                    </p>
                </div>
            </div>

            {/* PINNED LITURGY SECTION (Takes Priority) */}
            {pinnedLiturgy && !isReadingPinned && (
                <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="active-ring absolute top-0 right-0 m-4"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500/30 text-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-400/30">
                                    En Curso
                                </span>
                                <span className="text-red-200 text-xs flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">push_pin</span>
                                    Fijado por el Sacerdote
                                </span>
                            </div>
                            <h2 className="text-2xl font-display font-bold mb-1">{pinnedLiturgy.title || "Santa Eucaristía"}</h2>
                            <p className="text-red-100 text-sm opacity-90">
                                {pinnedLiturgy.date ? new Date(pinnedLiturgy.date.seconds * 1000).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoy'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsReadingPinned(true)}
                            className="w-full md:w-auto px-6 py-3 bg-white text-red-900 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">menu_book</span>
                            SEGUIR LITURGIA
                        </button>
                    </div>
                </div>
            )}

            {/* FULL SCREEN READER MODE */}
            {isReadingPinned && pinnedLiturgy && (
                <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-slide-in">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Leyendo</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">

                {/* Column 1: Priority (Next Liturgy & Actions) */}
                <div className="space-y-6">
                    {/* Hide automatic suggestion if Pinned exists to avoid confusion, or keep as "Upcoming"? Keeping it. */}
                    {!pinnedLiturgy && (
                        <section>
                            <section>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Próxima Celebración</h3>
                                <NextLiturgyCard onClick={() => onNavigate('generator')} />
                            </section>
                        </section>
                    )}

                    <section>
                        <NoticesCard />
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Accesos</h3>
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
                </div>

                {/* Column 2: Management */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Gestión Pastoral</h3>
                        <RolesCard docContent={docContent} />
                    </section>
                    <section>
                        <StatsCard />
                    </section>
                    <section>
                        <IntentionsCard date={date} />
                    </section>
                </div>

                {/* Column 3: Finance & Checklist */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Sacristía</h3>
                        <SacristyStatusCard date={date} />
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Administración</h3>
                        <FinanceCard />
                    </section>

                    <section>
                        <QuickCertCard />
                    </section>
                </div>

            </div>
        </main>
    );
}
