import { LITURGY_PROPIOS } from '../../services/config';
import Clock from './Clock';

export default function Sidebar({
    tradition, setTradition,
    celebrationKey, setCelebrationKey,
    cycleInfo, selectedDate,
    onGenerate,
    className
}) {

    const traditions = [
        { value: 'anglicana', label: 'Anglicana (ACNA)' },
        { value: 'ordinariato', label: 'Ordinariato (DW:TM)' },
        { value: 'tridentina', label: 'Tridentina (1962)' },
        { value: 'catolica', label: 'Católica (Novus Ordo)' }
    ];

    const currentOptions = LITURGY_PROPIOS[tradition] || [];

    return (
        <aside id="sidebar" className={`w-80 bg-white h-screen fixed md:sticky top-0 shadow-2xl flex flex-col z-40 transition-transform duration-300 ${className}`}>
            {/* Header */}
            <div className="p-6 pb-2 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-800 rounded-xl shadow-lg flex items-center justify-center text-white font-serif text-xl font-bold">L</div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 leading-none tracking-tight">Generador Litúrgico</h1>
                        <span className="text-[10px] text-teal-600 font-bold tracking-[0.2em] uppercase">Pro Edition AI</span>
                    </div>
                </div>
                <Clock />
            </div>

            {/* Controls */}
            <div className="p-6 pt-2 flex-1 overflow-y-auto space-y-6">

                {/* Tradition Select */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Tradición / Rito</label>
                    <div className="relative group">
                        <select
                            value={tradition}
                            onChange={(e) => setTradition(e.target.value)}
                            className="neu-select w-full bg-[#f0f2f5] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all hover:bg-gray-100"
                        >
                            {traditions.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-teal-600 transition-colors">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Celebration Select */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Celebración</label>
                    <div className="relative group">
                        <select
                            value={celebrationKey}
                            onChange={(e) => setCelebrationKey(e.target.value)}
                            className="neu-select w-full bg-[#f0f2f5] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all hover:bg-gray-100"
                        >
                            {currentOptions.map((groupOrOpt, idx) => {
                                if (groupOrOpt.disabled) {
                                    return <optgroup key={idx} label={groupOrOpt.label} />;
                                }
                                // Note: In the original file, it mixed OptGroups and Options in the array.
                                // My config.js structure has objects that are either header (disabled) or option.
                                // React select doesn't support 'header' items easily except as disabled options or optgroups.
                                // Simulating legacy behavior:
                                if (groupOrOpt.disabled) {
                                    // It's a header line
                                    return <option key={idx} disabled className="font-bold text-gray-400 bg-gray-50 uppercase tracking-wider text-[10px] py-1">{groupOrOpt.label}</option>;
                                }
                                return <option key={groupOrOpt.value} value={groupOrOpt.value}>{groupOrOpt.label}</option>;
                            })}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-teal-600 transition-colors">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Info Display */}
                <div className="neu-flat p-4 mt-2 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-1">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fecha Litúrgica</p>
                            <p className="text-sm font-bold text-teal-700 mt-1">
                                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', numeric: 'auto', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-normal text-gray-500">{cycleInfo}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Button */}
            <div className="p-6 shrink-0 z-20 mt-auto">
                <button
                    onClick={onGenerate}
                    className="w-full py-4 bg-white border border-gray-200 rounded-xl text-teal-800 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                    <span className="group-hover:scale-110 transition-transform text-lg">✨</span> Generar Liturgia
                </button>
                <div className="mt-5 text-[10px] text-gray-400 text-center font-bold tracking-wider opacity-50">
                    v7.0 REACT EDITION
                </div>
            </div>
        </aside>
    );
}
