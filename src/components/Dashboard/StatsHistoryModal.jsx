import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { createPortal } from 'react-dom';

export default function StatsHistoryModal({ onClose }) {
    const getHistory = () => {
        try {
            const allStats = JSON.parse(localStorage.getItem('liturgia_stats') || '{}');
            return Object.entries(allStats)
                .map(([date, stats]) => ({
                    date: new Date(date),
                    ...stats,
                    total: (parseInt(stats.men || 0) + parseInt(stats.women || 0) + parseInt(stats.children || 0))
                }))
                .sort((a, b) => b.date - a.date);
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const history = getHistory();

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-[var(--bg-main)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:fixed print:inset-0 print:max-w-none print:max-h-none print:rounded-none print:shadow-none print:z-[100] print:bg-white"
                onClick={e => e.stopPropagation()}
            >
                {/* Header (No Print) */}
                <div className="flex items-center justify-between p-6 print:hidden">
                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        Historial de Asistencia
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="neumorphic-btn px-4 py-2 text-gray-700 dark:text-gray-200 text-sm font-bold flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Imprimir
                        </button>
                        <button onClick={onClose} className="neumorphic-btn w-10 h-10">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Print Header (Only Print) */}
                <div className="hidden print:block p-8 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte de Asistencia</h1>
                    <p className="text-sm text-gray-500">Generado el {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full text-left border-collapse neumorphic-inset rounded-xl overflow-hidden">
                        <thead className="bg-[#e0e5ec] dark:bg-[#16181e] sticky top-0 z-10 print:static">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10">Fecha</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 text-center">Hombres</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 text-center">Mujeres</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 text-center">Niños</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 text-center text-primary">Total</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 text-center bg-gray-100 dark:bg-white/10">Comulgantes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 italic">No hay registros guardados.</td>
                                </tr>
                            ) : (
                                history.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors print:break-inside-avoid">
                                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {format(row.date, "d MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 text-center">{row.men || '-'}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 text-center">{row.women || '-'}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 text-center">{row.children || '-'}</td>
                                        <td className="p-4 text-sm font-bold text-primary text-center">{row.total}</td>
                                        <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-100 text-center bg-gray-50/50 dark:bg-white/5">{row.communicants || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>,
        document.body
    );
}
