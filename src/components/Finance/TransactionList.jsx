import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FINANCE_CATEGORIES as categories } from '../../utils/financeCategories';

export default function TransactionList({ transactions, currentDate, formatMoney, onDownloadReceipt, onDelete, userRole, checkPermission }) {

    // Permission check for actions
    const canManage = userRole === 'admin' || (checkPermission && checkPermission('manage_treasury'));

    const filteredTransactions = transactions.filter(t => {
        if (!t.date) return false;
        const d = t.date.toDate ? t.date.toDate() : new Date(t.date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    return (
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-stone-800 flex items-center justify-between bg-gray-50/50 dark:bg-stone-800/50">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Movimientos Recientes</h3>
                    <span className="text-xs font-mono text-gray-400">
                        {filteredTransactions.length} total
                    </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-stone-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl opacity-20">receipt_long</span>
                            <p>No hay movimientos este mes</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <div key={t.id} className="p-4 hover:bg-gray-50 dark:hover:bg-stone-800/50 transition-colors group flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                        ${t.type === 'income'
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {t.type === 'income' ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                            {categories[t.type].find(c => c.id === t.category)?.label || t.category}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t.date && format(t.date.toDate ? t.date.toDate() : new Date(t.date), "d MMM, HH:mm", { locale: es })}
                                            {t.description && ` • ${t.description}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                                    </span>
                                    {canManage && (
                                        <div className="flex items-center gap-1">
                                            {t.type === 'income' && (
                                                <button
                                                    onClick={() => onDownloadReceipt(t)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Descargar Recibo"
                                                >
                                                    <span className="material-symbols-outlined text-lg">receipt</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDelete(t.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
