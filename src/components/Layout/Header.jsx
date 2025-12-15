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
    onHistory
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

                {/* Tradition Selector */}
                <div className="relative group shrink-0">
                    <select
                        value={tradition}
                        onChange={(e) => setTradition(e.target.value)}
                        className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all outline-none"
                    >
                        {traditions.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
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
