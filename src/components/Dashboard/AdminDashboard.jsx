import React from 'react';
import NextLiturgyCard from './NextLiturgyCard';
import IntentionsCard from './IntentionsCard';
import NoticesCard from './NoticesCard';
import StyledCard from '../Common/StyledCard';
import RolesCard from './RolesCard';
import SacristyStatusCard from './SacristyStatusCard';
import FinanceCard from './FinanceCard';
import StatsCard from './StatsCard';
import QuickCertCard from './QuickCertCard';

export default function AdminDashboard({
    onNavigate,
    date,
    userRole,
    checkPermission,
    setIsCommOpen,
    pinnedLiturgy
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {/* Column 1: Priority & Devotion */}
            <div className="space-y-6">
                {!pinnedLiturgy && (
                    <section>
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 px-1">Próxima Celebración</h3>
                        <NextLiturgyCard onClick={() => onNavigate('generator')} />
                    </section>
                )}
                <section>
                    <IntentionsCard date={date} />
                </section>
                <section>
                    <NoticesCard />
                </section>
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
            </div>

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
        </div>
    );
}
