import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FinancialCards({ summary, formatMoney, currentDate }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="neumorphic-card p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-stone-800 dark:to-stone-900 border-l-4 border-l-red-600">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Saldo Actual</p>
                <h3 className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tighter">
                    {formatMoney(summary.balance)}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Acumulado {format(currentDate, 'MMMM', { locale: es })}</p>
            </div>
            <div className="neumorphic-card p-4 md:p-6 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Entradas</p>
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </span>
                </div>
                <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-tighter">
                    {formatMoney(summary.income)}
                </h3>
            </div>
            <div className="neumorphic-card p-4 md:p-6 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Salidas</p>
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </span>
                </div>
                <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-tighter">
                    {formatMoney(summary.expense)}
                </h3>
            </div>
        </div>
    );
}
