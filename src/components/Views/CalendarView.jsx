import DatePicker from "react-datepicker";
import { es } from 'date-fns/locale';

export default function CalendarView({ selectedDate, onDateChange, onNavigate }) {
    return (
        <main className="flex-1 flex flex-col px-4 pt-6 pb-24 w-full max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-display">Calendario Litúrgico</h2>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-white/5">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        onDateChange(date);
                        // Optional: Navigate to generator on selection? 
                        // For now just select.
                    }}
                    inline
                    locale={es}
                    calendarClassName="w-full !border-0 !font-sans"
                    dayClassName={() => "rounded-full hover:bg-primary hover:text-white transition-colors"}
                />
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-display">Acciones</h3>
                <button
                    onClick={() => onNavigate('generator')}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">menu_book</span>
                    Ver Liturgia del Día Seleccionado
                </button>
            </div>
        </main>
    );
}
