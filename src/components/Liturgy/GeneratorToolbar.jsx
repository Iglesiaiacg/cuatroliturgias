import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

registerLocale('es', es);

export default function GeneratorToolbar({
    tradition, setTradition,
    selectedDate, setSelectedDate,
    calculatedFeast,
    onGenerate,
    onHistory,
    onPin
}) {

    const traditions = [
        { value: 'anglicana', label: 'Anglicana' },
        { value: 'ordinariato', label: 'Ordinariato' },
        { value: 'tridentina', label: 'Tridentina' },
        { value: 'catolica', label: 'Católica' }
    ];

    return (
        <div className="w-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 py-3 px-4 flex flex-col md:flex-row items-center justify-between gap-4 z-40">

            {/* Left: Controls */}
            <div className="flex flex-1 items-center gap-4 overflow-x-auto no-scrollbar w-full md:w-auto mask-linear-fade">
                {/* Tradition Selector */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg shrink-0">
                    {traditions.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTradition(t.value)}
                            className={`
                                px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all whitespace-nowrap
                                ${tradition === t.value
                                    ? 'bg-white dark:bg-white/10 text-primary shadow-sm dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5'}
                            `}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Date Picker */}
                <div className="relative">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        portalId="root"
                        className="w-28 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 text-center cursor-pointer outline-none transition-all"
                    />
                </div>

                {/* Feast Label */}
                {calculatedFeast && (
                    <div className="flex flex-col items-start leading-none border-l border-gray-200 dark:border-white/10 pl-4 w-32 md:w-auto overflow-hidden">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Liturgia del Día</span>
                        <span className="text-xs font-bold text-primary truncate w-full" title={calculatedFeast}>{calculatedFeast}</span>
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <button
                    onClick={onHistory}
                    className="h-9 px-3 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-white/10 gap-2"
                    title="Historial"
                >
                    <span className="material-symbols-outlined text-lg">history</span>
                    <span className="text-xs font-bold hidden sm:inline">Historial</span>
                </button>
                <button
                    onClick={onGenerate}
                    className="h-9 px-4 bg-primary hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <span>Generar</span>
                </button>
                {onPin && (
                    <button
                        onClick={onPin}
                        className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-600 border border-red-200 transition-colors"
                        title="Fijar en Inicio (Publicar)"
                    >
                        <span className="material-symbols-outlined text-lg">push_pin</span>
                    </button>
                )}
            </div>
        </div>
    );
}
