import { useState, useEffect } from 'react';
import { useFinanceSync } from '../../hooks/useFinanceSync';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getLiturgicalColor, getLiturgicalRubrics, identifyFeast, getLiturgicalCycle } from '../../services/liturgy';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

import LiturgicalVestmentCard from './LiturgicalVestmentCard';
import MinistersOnDutyCard from './MinistersOnDutyCard';
// ... other imports


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
