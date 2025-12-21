import { useState } from 'react';
import { useFinanceSync } from '../../hooks/useFinanceSync';
import { useAuth } from '../../context/AuthContext';

export default function FinanceCard() {
    // Only fetch last ~50 transactions for summary to save bandwidth, 
    // or fetch all if needed for accurate monthly balance. 
    // For a card, catching 100 is safe.
    const { transactions, loading } = useFinanceSync(100);
    const { checkPermission } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    // If no permission, show nothing or placeholder
    if (!checkPermission('view_treasury')) {
        return null;
    }

    const calculateSummary = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthTransactions = transactions.filter(t => {
            if (!t.date) return false;
            // Handle Firestore Timestamp or ISO string
            const d = t.date.toDate ? t.date.toDate() : new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        // Overall balance logic might require fetching ALL history, 
        // using just monthly balance for now or summing visible transactions.
        // For a simple card, let's use the sum of loaded transactions as "Current Balance" (Assuming transactions is descending valid list)
        // OR better: Just show Monthly balance flow.
        const totalBalance = transactions
            .reduce((sum, t) => sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);

        return {
            income,
            expense,
            balance: totalBalance,
            monthName: new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(now)
        };
    };

    const summary = calculateSummary();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    return (
        <div className="neumorphic-card p-6 flex flex-col justify-between h-full relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">savings</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Finanzas ({summary.monthName})</span>
                </div>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">
                        {isVisible ? 'visibility' : 'visibility_off'}
                    </span>
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saldo (Registrado)</span>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                        {isVisible ? formatMoney(summary.balance) : '****'}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex-1">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 dark:text-green-400 mb-0.5">
                            <span className="material-symbols-outlined text-sm">arrow_upward</span>
                            Entradas
                        </div>
                        <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-300">
                            {isVisible ? formatMoney(summary.income) : '****'}
                        </div>
                    </div>
                    <div className="flex-1 border-l border-gray-100 dark:border-white/5 pl-4">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 dark:text-red-400 mb-0.5">
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                            Salidas
                        </div>
                        <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-300">
                            {isVisible ? formatMoney(summary.expense) : '****'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
