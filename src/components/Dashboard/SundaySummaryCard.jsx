import { useState, useEffect } from 'react';
import { useFinanceSync } from '../../hooks/useFinanceSync';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getLiturgicalColor, getLiturgicalRubrics, identifyFeast, getLiturgicalCycle } from '../../services/liturgy';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

// --- SUB-COMPONENT: VESTMENT & RUBRICS CARD ---
function LiturgicalVestmentCard({ date }) {
    const colorData = getLiturgicalColor(date);
    // Default to 'romana' or fetch from settings context if available. For now 'romana' is safe default.
    const rubrics = getLiturgicalRubrics(date, 'romana');

    // SENIOR LITURGIST ADDITIONS:
    const cycle = getLiturgicalCycle(date);
    const feastName = identifyFeast(date);

    return (
        <div className={`neumorphic-card p-6 border-l-4 ${colorData.classes?.split(' ')[0]?.replace('bg-', 'border-')} relative overflow-hidden`}>
            {/* Background Tint */}
            <div className={`absolute inset-0 opacity-10 ${colorData.classes?.split(' ')[0]}`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="uppercase text-xs font-bold text-gray-500 tracking-wider mb-1">
                            {cycle.text}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full shadow-lg border-2 border-white dark:border-stone-800 ${colorData.code === 'purple' ? 'bg-purple-700' : colorData.code === 'red' ? 'bg-red-700' : colorData.code === 'green' ? 'bg-green-700' : 'bg-slate-100'}`}></span>
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight capitalize">
                                    {feastName}
                                </h2>
                                <p className="text-xs font-bold opacity-60 uppercase">{colorData.name}</p>
                            </div>
                        </div>
                    </div>
                    {/* Visual Vestment Icon Placeholder */}
                    <div className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 text-3xl ${colorData.code === 'purple' ? 'text-purple-700' : colorData.code === 'red' ? 'text-red-700' : colorData.code === 'green' ? 'text-green-700' : 'text-slate-700'}`}>
                        <span className="material-symbols-outlined">apparel</span>
                    </div>
                </div>

                {/* RUBRICS CHECKLIST */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-white/60 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.gloria ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Gloria</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.gloria ? 'check_circle' : 'cancel'}</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.alleluia ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Aleluya</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.alleluia ? 'check_circle' : 'cancel'}</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.credo ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Credo</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.credo ? 'check_circle' : 'cancel'}</span>
                    </div>
                </div>

                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Prefacio Sugerido: <span className="font-bold text-gray-700 dark:text-gray-300">{rubrics.preface}</span></p>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: MINISTERS ON DUTY CARD ---
function MinistersOnDutyCard({ date }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                // Get assignments where date string matches YYYY-MM-DD
                const dateStr = format(date, 'yyyy-MM-dd');
                const q = query(
                    collection(db, 'assignments'),
                    where('date', '==', dateStr)
                );

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAssignments(data);
            } catch (error) {
                console.error("Error fetching roster:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [date]);

    // Group by Role
    const getRoleName = (roleId) => {
        const map = {
            'reader': 'Lector',
            'acolyte': 'Acólito',
            'musician': 'Músico',
            'sacristan': 'Sacristán',
            'treasurer': 'Colecta'
        };
        return map[roleId] || roleId;
    };

    return (
        <div className="neumorphic-card p-6 border-l-4 border-indigo-500 bg-white dark:bg-stone-900">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">group</span>
                Ministros de Hoy
            </h3>

            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                    <p className="text-sm text-gray-500 italic">Sin asignaciones confirmadas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map((assign) => (
                        <div key={assign.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                                    {getRoleName(assign.role).charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{assign.userName || 'Sin asignar'}</p>
                                    <p className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">{getRoleName(assign.role)}</p>
                                </div>
                            </div>
                            {/* Status Icon */}
                            <span className="material-symbols-outlined text-green-500 text-sm" title="Confirmado">check_circle</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SundaySummaryCard() {
    const today = new Date();

    // 1. FUNDS SUMMARY (Existing logic kept for context)
    const { transactions } = useFinanceSync(100);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // 2. UPCOMING EVENTS (Next 7 days for announcements)
    const { getEventsForDate } = useCalendarEvents();
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const events = [];
        // Start from today
        for (let i = 0; i <= 7; i++) {
            const date = addDays(today, i);
            const dayEvents = getEventsForDate(date);
            dayEvents.forEach(evt => {
                if (evt.type !== 'finance') {
                    events.push({ ...evt, date });
                }
            });
        }
        setUpcomingEvents(events.slice(0, 5));
    }, [getEventsForDate]);

    return (
        <div className="space-y-6">
            {/* NEW: VESTMENT & RUBRICS */}
            <LiturgicalVestmentCard date={today} />

            {/* NEW: MINISTERS ON DUTY */}
            <MinistersOnDutyCard date={today} />

            {/* FUNDS READ-ONLY */}
            <div className="neumorphic-card p-6 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase text-xs tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">savings</span>
                        Fondos Disponibles
                    </h3>
                    <span className="bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Solo Lectura
                    </span>
                </div>
                <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                    ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">Saldo actual en tesorería</p>
            </div>

            {/* UPCOMING EVENTS FOR ANNOUNCEMENTS */}
            <div className="neumorphic-card p-6 border-l-4 border-blue-500 bg-white dark:bg-stone-900">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">campaign</span>
                    Para Anunciar
                </h3>

                {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay eventos próximos para anunciar.</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingEvents.map((evt, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="text-center min-w-[3rem] p-1 bg-gray-100 dark:bg-stone-800 rounded-lg">
                                    <span className="block text-xs font-bold text-red-600 uppercase">{format(evt.date, 'MMM', { locale: es })}</span>
                                    <span className="block text-lg font-bold text-gray-800 dark:text-gray-200">{format(evt.date, 'd')}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{evt.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{evt.time || 'Todo el día'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
