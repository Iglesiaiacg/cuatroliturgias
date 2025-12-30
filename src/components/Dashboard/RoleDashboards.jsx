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
import CommunicationCenter from './CommunicationCenter';

// Helper for persistent modal state
const shouldShowDuties = (role) => {
    const lastSeen = localStorage.getItem(`duties_seen_${role}`);
    const today = new Date().toDateString();
    return lastSeen !== today;
};

const markDutiesSeen = (role) => {
    localStorage.setItem(`duties_seen_${role}`, new Date().toDateString());
};

// --- 1. TREASURER DASHBOARD ---
export function TreasurerDashboard({ onNavigate, docContent }) {
    const [showDuties, setShowDuties] = useState(() => shouldShowDuties('treasurer'));
    const [isCommOpen, setIsCommOpen] = useState(false);

    const handleCloseDuties = () => {
        setShowDuties(false);
        markDutiesSeen('treasurer');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in relative">
            <DutiesModal role="treasurer" isOpen={showDuties} onClose={handleCloseDuties} />
            {isCommOpen && <CommunicationCenter onClose={() => setIsCommOpen(false)} />}

            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Tesorería Parroquial</h2>
                <p className="text-gray-500">Gestión de recursos y ofrendas</p>
            </header>

            {/* Comm Button */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="w-full neumorphic-card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-stone-50 dark:from-red-900/10 dark:to-stone-900/10 border border-red-100 dark:border-red-800 mb-6 hover:scale-[1.01] transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">Centro de Comunicaciones</h3>
                    <p className="text-xs text-red-600 dark:text-red-300 font-medium">Chat de Equipo y Avisos</p>
                </div>
                <span className="material-symbols-outlined text-red-300 ml-auto">open_in_new</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action: View Liturgy */}
                <button
                    onClick={() => onNavigate('generator')}
                    className="neumorphic-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.02] hover:bg-primary transition-all group"
                >
                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800 dark:text-red-400 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-4xl">menu_book</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-white">Ver Liturgia</h3>
                    <p className="text-sm text-gray-500 group-hover:text-red-100">Consultar guion de la misa</p>
                </button>

                {/* Main Action: Register Offering */}
                <button
                    onClick={() => onNavigate('offerings')}
                    className="neumorphic-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.02] hover:bg-primary transition-all group"
                >
                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800 dark:text-red-400 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-4xl">savings</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-white">Registrar Ofrenda</h3>
                    <p className="text-sm text-gray-500 group-hover:text-red-100">Ingresar diezmos, colectas o donativos</p>
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
export function SacristanDashboard({ onNavigate, date, docContent, season }) {
    const [showDuties, setShowDuties] = useState(() => shouldShowDuties('sacristan'));
    const [isCommOpen, setIsCommOpen] = useState(false);

    const handleCloseDuties = () => {
        setShowDuties(false);
        markDutiesSeen('sacristan');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in relative">
            <DutiesModal role="sacristan" isOpen={showDuties} onClose={handleCloseDuties} />
            {isCommOpen && <CommunicationCenter onClose={() => setIsCommOpen(false)} />}

            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Sacristía Virtual</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-gray-500">Todo listo para el altar</p>
                    {/* UNIFICATION: Show Liturgical Color if known */}
                    {season && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${season.color === 'morado' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            season.color === 'rojo' ? 'bg-red-100 text-red-800 border-red-200' :
                                season.color === 'verde' ? 'bg-green-100 text-green-800 border-green-200' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                            {season.color || 'Color del Día'}
                        </span>
                    )}
                </div>
            </header>

            {/* Comm Button */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="w-full neumorphic-card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-stone-50 dark:from-red-900/10 dark:to-stone-900/10 border border-red-100 dark:border-red-800 mb-6 hover:scale-[1.01] transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">Centro de Comunicaciones</h3>
                    <p className="text-xs text-red-600 dark:text-red-300 font-medium">Chat de Equipo y Avisos</p>
                </div>
                <span className="material-symbols-outlined text-red-300 ml-auto">open_in_new</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Status */}
                <div className="flex flex-col gap-6">
                    <SacristyStatusCard />

                    <button
                        onClick={() => onNavigate('generator')}
                        className="w-full neumorphic-card p-6 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800">
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
                        <span className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800">
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
                        <span className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800">
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
export function SecretaryDashboard({ onNavigate, date, docContent }) {
    const [showDuties, setShowDuties] = useState(() => shouldShowDuties('secretary'));
    const [isCommOpen, setIsCommOpen] = useState(false);

    const handleCloseDuties = () => {
        setShowDuties(false);
        markDutiesSeen('secretary');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in relative">
            <DutiesModal role="secretary" isOpen={showDuties} onClose={handleCloseDuties} />
            {isCommOpen && <CommunicationCenter onClose={() => setIsCommOpen(false)} />}

            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Secretaría</h2>
                <p className="text-gray-500">Agenda, Certificados y Feligresía</p>
            </header>

            {/* Comm Button */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="w-full neumorphic-card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-stone-50 dark:from-red-900/10 dark:to-stone-900/10 border border-red-100 dark:border-red-800 mb-6 hover:scale-[1.01] transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">Centro de Comunicaciones</h3>
                    <p className="text-xs text-red-600 dark:text-red-300 font-medium">Chat de Equipo y Avisos</p>
                </div>
                <span className="material-symbols-outlined text-red-300 ml-auto">open_in_new</span>
            </button>

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
                            className="w-full neumorphic-card p-4 flex items-center justify-between text-left gap-4 hover:scale-[1.01] hover:bg-primary transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800 group-hover:bg-white/20 group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-2xl">menu_book</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-white">Ver Liturgia Completa</h3>
                                    <p className="text-xs text-gray-500 group-hover:text-red-100">Consultar guiones pasados o futuros</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-white">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Col 2: Directory & Certs */}
                <div className="space-y-6">
                    <button
                        onClick={() => onNavigate('directory')}
                        className="w-full neumorphic-card p-6 flex flex-col items-center text-center gap-3 hover:scale-[1.02] hover:bg-primary transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800 group-hover:bg-white/20 group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">search</span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-white">Buscar Fiel</h3>
                        <p className="text-xs text-gray-500 group-hover:text-red-100">Directorio telefónico y datos</p>
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
export function MusicianDashboard({ onNavigate, docContent, calculatedFeast }) {
    const [showDuties, setShowDuties] = useState(() => shouldShowDuties('musician'));
    const [isCommOpen, setIsCommOpen] = useState(false);

    const handleCloseDuties = () => {
        setShowDuties(false);
        markDutiesSeen('musician');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in relative">
            <DutiesModal role="musician" isOpen={showDuties} onClose={handleCloseDuties} />
            {isCommOpen && <CommunicationCenter onClose={() => setIsCommOpen(false)} />}

            <header className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Ministerio de Canto</h2>
                <p className="text-gray-500">Preparación musical para la liturgia</p>
            </header>

            {/* Comm Button */}
            <button
                onClick={() => setIsCommOpen(true)}
                className="w-full neumorphic-card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-stone-50 dark:from-red-900/10 dark:to-stone-900/10 border border-red-100 dark:border-red-800 mb-6 hover:scale-[1.01] transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">Centro de Comunicaciones</h3>
                    <p className="text-xs text-red-600 dark:text-red-300 font-medium">Chat de Equipo y Avisos</p>
                </div>
                <span className="material-symbols-outlined text-red-400 ml-auto transition-colors group-hover:text-red-600">open_in_new</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Liturgy Info - UNIFIED */}
                <div className="space-y-6">
                    <NextLiturgyCard />

                    {/* EXTRACTED HYMNS CARD */}
                    {docContent && (
                        <div className="neumorphic-card p-6 border-l-4 border-red-500 animate-slide-in">
                            <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">queue_music</span>
                                Sugerencias del Guion
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {extractSection(docContent, 'cantos') ? (
                                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                                        {extractSection(docContent, 'cantos')}
                                    </div>
                                ) : (
                                    <p className="italic opacity-70">No se detectaron sugerencias específicas en el guion generado. (Revisa la sección 'Cantos' o 'Música').</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Music Tools */}
                <div className="space-y-4">
                    <button
                        onClick={() => onNavigate('music')}
                        className="w-full neumorphic-card p-8 flex flex-col items-center text-center gap-4 hover:scale-[1.02] hover:bg-primary transition-all group"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-800 dark:text-red-400 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined text-4xl">music_note</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-white">Cantoral Digital</h3>
                        <p className="text-sm text-gray-500 group-hover:text-red-100">Ver acordes y gestionar banco de canciones</p>
                    </button>

                    {/* Quick Access to Generator for Full Context */}
                    <button
                        onClick={() => onNavigate('generator')}
                        className="w-full neumorphic-card p-4 flex items-center gap-4 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-800">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-sm">Ver Guion Completo</h4>
                            <p className="text-xs text-gray-500">Leer lecturas para inspirar cantos</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 5. ACOLYTE DASHBOARD ---
export function AcolyteDashboard({ pinnedLiturgy }) {
    const [showDuties, setShowDuties] = useState(() => shouldShowDuties('acolyte'));

    const handleCloseDuties = () => {
        setShowDuties(false);
        markDutiesSeen('acolyte');
    };

    if (!pinnedLiturgy) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                <DutiesModal role="acolyte" isOpen={showDuties} onClose={handleCloseDuties} />
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">church</span>
                <h3 className="text-xl font-bold text-gray-500">No hay liturgia activa</h3>
                <p className="text-gray-400">Espera a que el sacerdote publique el guion.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-4 animate-fade-in">
            <DutiesModal role="acolyte" isOpen={showDuties} onClose={handleCloseDuties} />
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
