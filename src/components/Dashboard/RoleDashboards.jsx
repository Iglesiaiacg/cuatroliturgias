import React, { useState } from 'react';
import { extractSection } from '../../utils/liturgyParser';

// Re-using existing cards
import FinanceCard from './FinanceCard';
import SacristyStatusCard from './SacristyStatusCard';
import IntentionsCard from './IntentionsCard';
import NextLiturgyCard from './NextLiturgyCard';
import Preview from '../Liturgy/Preview';
import QuickCertCard from './QuickCertCard';
import DutiesModal from './DutiesModal';

// --- 1. TREASURER DASHBOARD ---
export function TreasurerDashboard({ onNavigate }) {
    const [showDuties, setShowDuties] = useState(true);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
            <DutiesModal role="treasurer" isOpen={showDuties} onClose={() => setShowDuties(false)} />
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Tesorería Parroquial</h2>
                <p className="text-gray-500">Gestión de recursos y ofrendas</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action: View Liturgy */}
                <button
                    onClick={() => onNavigate('generator')}
                    className="neumorphic-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.02] transition-transform group"
                >
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-4xl">menu_book</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ver Liturgia</h3>
                    <p className="text-sm text-gray-500">Consultar guion de la misa</p>
                </button>

                {/* Main Action: Register Offering */}
                <button
                    onClick={() => onNavigate('offerings')}
                    className="neumorphic-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.02] transition-transform group"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-4xl">savings</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Ofrenda</h3>
                    <p className="text-sm text-gray-500">Ingresar diezmos, colectas o donativos</p>
                </button>

                {/* Quick Stats */}
                <div className="h-full">
                    <FinanceCard />
                </div>
            </div>
        </div>
    );
}

// --- 2. SACRISTAN DASHBOARD ---
export function SacristanDashboard({ onNavigate, date }) {
    const [showDuties, setShowDuties] = useState(true);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
            <DutiesModal role="sacristan" isOpen={showDuties} onClose={() => setShowDuties(false)} />
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Sacristía Virtual</h2>
                <p className="text-gray-500">Todo listo para el altar</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Status */}
                <div className="flex flex-col gap-6">
                    <SacristyStatusCard />

                    <button
                        onClick={() => onNavigate('generator')}
                        className="w-full neumorphic-card p-6 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-2xl">menu_book</span>
                        </span>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800 dark:text-white">Ver Liturgia</h3>
                            <p className="text-xs text-gray-500">Consultar el guion para el altar</p>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-gray-300">arrow_forward_ios</span>
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <button
                        onClick={() => onNavigate('sacristy')}
                        className="w-full neumorphic-card p-6 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-2xl">checklist</span>
                        </span>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800 dark:text-white">Checklist Dominical</h3>
                            <p className="text-xs text-gray-500">Revisar preparativos para la misa</p>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-gray-300">arrow_forward_ios</span>
                    </button>

                    <button
                        onClick={() => onNavigate('sacristy')}
                        className="w-full neumorphic-card p-6 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-2xl">inventory_2</span>
                        </span>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800 dark:text-white">Inventario Completo</h3>
                            <p className="text-xs text-gray-500">Gestionar existencias de vino, hostias...</p>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-gray-300">arrow_forward_ios</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 3. SECRETARY DASHBOARD ---
export function SecretaryDashboard({ onNavigate, date }) {
    const [showDuties, setShowDuties] = useState(true);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
            <DutiesModal role="secretary" isOpen={showDuties} onClose={() => setShowDuties(false)} />
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Secretaría</h2>
                <p className="text-gray-500">Agenda, Certificados y Feligresía</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Col 1: Intentions (Priority for Secretary) */}
                <div className="lg:col-span-2">
                    <IntentionsCard />
                    <div className="mt-6">
                        <NextLiturgyCard />
                    </div>
                    <div className="mt-6">
                         <button
                            onClick={() => onNavigate('generator')}
                            className="w-full neumorphic-card p-4 flex items-center justify-between text-left gap-4 hover:scale-[1.01] transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                    <span className="material-symbols-outlined text-2xl">menu_book</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white">Ver Liturgia Completa</h3>
                                    <p className="text-xs text-gray-500">Consultar guiones pasados o futuros</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Col 2: Directory & Certs */}
                <div className="space-y-6">
                    <button
                        onClick={() => onNavigate('directory')}
                        className="w-full neumorphic-card p-6 flex flex-col items-center text-center gap-3 hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                            <span className="material-symbols-outlined text-3xl">search</span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Buscar Fiel</h3>
                        <p className="text-xs text-gray-500">Directorio telefónico y datos</p>
                    </button>

                    <div className="h-full">
                        <QuickCertCard />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 4. MUSICIAN DASHBOARD ---
export function MusicianDashboard({ onNavigate }) {
    const [showDuties, setShowDuties] = useState(true);
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
            <DutiesModal role="musician" isOpen={showDuties} onClose={() => setShowDuties(false)} />
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Ministerio de Canto</h2>
                <p className="text-gray-500">Preparación musical para la liturgia</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Liturgy Info */}
                <NextLiturgyCard />

                {/* Music Tools */}
                <div className="space-y-4">
                    <button
                        onClick={() => onNavigate('music')}
                        className="w-full neumorphic-card p-8 flex flex-col items-center text-center gap-4 hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
                            <span className="material-symbols-outlined text-4xl">music_note</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cantoral Digital</h3>
                        <p className="text-sm text-gray-500">Ver acordes y gestionar banco de canciones</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 5. ACOLYTE DASHBOARD ---
export function AcolyteDashboard({ pinnedLiturgy }) {
    const [showDuties, setShowDuties] = useState(true);
    if (!pinnedLiturgy) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                <DutiesModal role="acolyte" isOpen={showDuties} onClose={() => setShowDuties(false)} />
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">church</span>
                <h3 className="text-xl font-bold text-gray-500">No hay liturgia activa</h3>
                <p className="text-gray-400">Espera a que el sacerdote publique el guion.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-4 animate-fade-in">
            <DutiesModal role="acolyte" isOpen={showDuties} onClose={() => setShowDuties(false)} />
            <header className="mb-6 text-center">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">Vista de Servidor</span>
                <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">{pinnedLiturgy.title}</h2>
            </header>

            <div className="neumorphic-card p-1">
                {/* Reuse Preview but maybe we force simple mode? */}
                <Preview content={pinnedLiturgy.content} rubricLevel={'simple'} />
            </div>
        </div>
    );
}
