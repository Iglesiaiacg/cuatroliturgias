import { useState, useEffect } from 'react';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function UpcomingEventsCard() {
    const today = new Date();
    const { getEventsForDate } = useCalendarEvents();
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const events = [];
        // Start from today, next 7 days
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
        <div className="neumorphic-card p-6 border-l-4 border-blue-500 bg-white dark:bg-stone-900 h-full">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">campaign</span>
                Para Anunciar
            </h3>

            {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                    <span className="material-symbols-outlined text-2xl mb-1 opacity-50">event_busy</span>
                    <p className="text-sm italic">Sin anuncios próximos</p>
                </div>
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
    );
}
