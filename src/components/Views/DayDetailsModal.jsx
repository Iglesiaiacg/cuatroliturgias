import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getLiturgicalColor, getLiturgicalCycle, identifyFeast } from '../../services/liturgy';

export default function DayDetailsModal({ date, onClose, onGenerate }) {
    if (!date) return null;

    const color = getLiturgicalColor(date);
    const feastName = identifyFeast(date); // Default to romana for general info
    const cycle = getLiturgicalCycle(date);

    // Format full date
    const dateStr = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

    // Capitalize first letter
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 transform transition-all animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Color */}
                <div className={`h-24 ${color.classes.replace('text-', 'bg-').split(' ')[0].replace('100', '500').replace('/50', '')} relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                    <div className="absolute -bottom-6 left-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white dark:bg-gray-800`}>
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-8 px-6 pb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{formattedDate}</span>
                    <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-1 mb-4 leading-tight">
                        {feastName}
                    </h2>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color Litúrgico</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${color.classes.replace('bg-', 'bg-').split(' ')[0].replace('100', '500')}`}></span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{color.name}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ciclo Leccionario</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cycle.text}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Salterio</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Semana [Calculada]</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tradición</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Latina / Mixta</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { onGenerate(date); onClose(); }} // Pass date to generator
                            className="flex-1 bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                            Generar Liturgia
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
