import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import Clock from './Clock';

registerLocale('es', es);

export default function Header({
    tradition, setTradition,
    selectedDate, setSelectedDate,
    calculatedFeast,
    onGenerate,
    onHistory,
    onSettings
}) {

    const traditions = [
        { value: 'anglicana', label: 'Anglicana' },
        { value: 'ordinariato', label: 'Ordinariato' },
        { value: 'tridentina', label: 'Tridentina' },
        { value: 'catolica', label: 'Católica' }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between shadow-sm transition-all">

            {/* 1. BRAND & CLOCK */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl shadow-lg flex items-center justify-center text-white font-serif text-lg font-bold">L</div>
                    <div className="hidden lg:block">
                        <h1 className="text-sm font-bold text-gray-900 leading-none tracking-tight">Liturgico</h1>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">CALENDAR EDITION</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
                <div className="hidden md:block">
                    <Clock />
                </div>
            </div>

            {/* 2. COMMAND CENTER (Calendar) */}
            <div className="flex-1 max-w-3xl px-4 md:px-12 flex items-center gap-4 justify-center">

                {/* Tradition Selector (Buttons) */}
                <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar shrink-0 max-w-[200px] md:max-w-none">
                    {traditions.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTradition(t.value)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap
                                ${tradition === t.value
                                    ? 'bg-white text-teal-700 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                            `}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Date Picker Wrapper */}
                <div className="relative flex items-center">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        className="w-28 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 text-center cursor-pointer outline-none transition-all"
                    />
                </div>

                {/* Calculated Feast Label */}
                <div className="hidden md:flex flex-col items-start justify-center h-10 border-l border-gray-200 pl-4 animate-fade-in">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Liturgia del Día</span>
                    <span className="text-xs font-bold text-teal-700 truncate max-w-[200px] lg:max-w-xs">{calculatedFeast}</span>
                </div>

            </div>

            {/* 3. ACTIONS */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    onClick={onSettings}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
                    title="Configuración API"
                >
                    <span className="text-xl">⚙️</span>
                </button>
                <button
                    onClick={onHistory}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
                    title="Historial"
                >
                    <span className="text-lg">↺</span>
                </button>
                <button
                    onClick={onGenerate}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span className="text-sm">✨</span> <span className="hidden sm:inline">Generar</span>
                </button>
            </div>
        </header>
    );
}
