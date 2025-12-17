import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getLiturgicalColor } from '../../services/liturgy';
import DayDetailsModal from './DayDetailsModal';

export default function CalendarView({ selectedDate, onDateChange, onNavigate }) {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
    const [viewedDate, setViewedDate] = useState(null); // Date currently shown in modal



    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const weekDaysShort = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <main className="flex-1 flex flex-col w-full h-full bg-white dark:bg-background-dark animate-fade-in pb-24 overflow-hidden">

            {/* Header / Month Navigator */}
            <div className="flex items-center justify-between px-6 py-4 bg-primary text-white shadow-md z-10">
                <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="text-xl font-bold font-display capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/50">
                {weekDaysShort.map((day, i) => (
                    <div key={day} className="py-3 text-center text-red-800 dark:text-red-200 font-bold text-xs uppercase tracking-wider">
                        <span className="hidden sm:inline">{weekDays[i]}</span>
                        <span className="sm:hidden">{day}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px">
                {calendarDays.map((date, idx) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentMonth = isSameMonth(date, monthStart);
                    const liturgicalColorClass = isCurrentMonth ? getLiturgicalColor(date).classes : 'bg-gray-50/50 text-gray-300 dark:text-gray-700';

                    return (
                        <div
                            key={date.toString()}
                            onClick={() => {
                                onDateChange(date);
                                setViewedDate(date);
                            }}
                            className={`
                                relative p-1 sm:p-2 flex flex-col items-start cursor-pointer hover:brightness-95 transition-all border border-transparent
                                ${liturgicalColorClass}
                                ${isSelected ? '!ring-2 ring-primary z-10' : ''}
                            `}
                        >
                            <span className={`
                                text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                ${isSameDay(date, new Date()) ? 'bg-primary text-white shadow-md' : ''}
                                ${isSelected && !isSameDay(date, new Date()) ? 'text-primary font-bold ring-2 ring-primary ring-offset-2' : ''}
                            `}>
                                {format(date, 'd')}
                            </span>

                            {/* Optional: Dot indicators for feasts could go here */}
                            {isSelected && (
                                <span className="mt-auto self-center text-[10px] text-primary font-bold uppercase tracking-tighter opacity-70">
                                    Seleccionado
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 flex justify-center">
                <button
                    onClick={() => onNavigate('generator')}
                    className="w-full max-w-sm py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold shadow-lg hover:translate-y-px transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                    <span>Ir a la Liturgia del {format(selectedDate, 'd MMM', { locale: es })}</span>
                </button>
            </div>
            {/* Day Details Modal */}
            {viewedDate && (
                <DayDetailsModal
                    date={viewedDate}
                    onClose={() => setViewedDate(null)}
                    onGenerate={(d) => {
                        onDateChange(d);
                        onNavigate('generator');
                    }}
                />
            )}
        </main>
    );
}
