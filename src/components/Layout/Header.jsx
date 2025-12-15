import { LITURGY_PROPIOS } from '../../services/config';
import Clock from './Clock';

export default function Header({
    tradition, setTradition,
    celebrationKey, setCelebrationKey,
    onGenerate,
    onHistory
}) {

    const traditions = [
        { value: 'anglicana', label: 'Anglicana' },
        { value: 'ordinariato', label: 'Ordinariato' },
        { value: 'tridentina', label: 'Tridentina' },
        { value: 'catolica', label: 'Católica' }
    ];

    const currentOptions = LITURGY_PROPIOS[tradition] || [];

    return (
        <header className="fixed top-0 left-0 right-0 h-18 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between shadow-sm">

            {/* 1. BRAND & CLOCK */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-emerald-800 rounded-lg shadow-md flex items-center justify-center text-white font-serif text-lg font-bold">L</div>
                    <div className="hidden lg:block">
                        <h1 className="text-sm font-bold text-gray-800 leading-none">Liturgico</h1>
                        <span className="text-[9px] text-teal-600 font-bold uppercase tracking-widest">PRO AI</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <Clock />
            </div>

            {/* 2. COMMAND CENTER (SELECTORS) */}
            <div className="flex-1 max-w-2xl px-6 flex items-center gap-3">
                {/* Tradition */}
                <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value)}
                    className="neu-select bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-white transition-all w-32 shrink-0"
                >
                    {traditions.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                {/* Celebration */}
                <select
                    value={celebrationKey}
                    onChange={(e) => setCelebrationKey(e.target.value)}
                    className="neu-select flex-1 bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-white transition-all"
                >
                    {currentOptions.map((groupOrOpt, idx) => {
                        if (groupOrOpt.disabled) {
                            return <option key={idx} disabled className="bg-gray-100 font-bold text-gray-500">{groupOrOpt.label}</option>;
                        }
                        return <option key={groupOrOpt.value} value={groupOrOpt.value}>{groupOrOpt.label}</option>;
                    })}
                </select>
            </div>

            {/* 3. ACTIONS */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onHistory}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Historial"
                >
                    ↺
                </button>
                <button
                    onClick={onGenerate}
                    className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span>✨</span> <span className="hidden sm:inline">Generar</span>
                </button>
            </div>
        </header>
    );
}
