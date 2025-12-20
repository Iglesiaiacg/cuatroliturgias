import React, { useMemo, forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AccountSheet = forwardRef(({ transactions, currentMonth, currentYear }, ref) => {

    // Calculate running balance and filter for the view
    const { monthlyTransactions } = useMemo(() => {
        // 1. Sort all transactions by date ascending
        const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 2. Calculate running balance for ALL history
        let runningBalance = 0;
        const withBalance = [];
        for (const t of sorted) {
            if (t.type === 'income') runningBalance += t.amount;
            else if (t.type === 'expense') runningBalance -= t.amount;
            withBalance.push({ ...t, balanceAfter: runningBalance });
        }

        // 3. Filter for the selected month/year
        const filtered = withBalance.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        return { monthlyTransactions: filtered };
    }, [transactions, currentMonth, currentYear]);

    const monthName = format(new Date(currentYear, currentMonth, 1), 'MMMM', { locale: es });

    return (
        <div ref={ref} className="bg-white p-8 max-w-[210mm] mx-auto text-black print:p-0">
            {/* Header */}
            <div className="text-center mb-8 uppercase border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold tracking-widest mb-1">Comunidad de Gracia</h1>
                <h2 className="text-xl font-bold mb-1">Hoja de Cuentas</h2>
                <h3 className="text-lg font-medium text-gray-700 capitalize">{monthName} {currentYear}</h3>
            </div>

            {/* Table */}
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 text-left font-bold uppercase w-24">Fecha</th>
                        <th className="py-2 text-left font-bold uppercase">Descripción</th>
                        <th className="py-2 text-right font-bold uppercase w-32 border-l border-gray-300 px-2">Entradas</th>
                        <th className="py-2 text-right font-bold uppercase w-32 border-l border-gray-300 px-2">Salidas</th>
                        <th className="py-2 text-right font-bold uppercase w-32 border-l border-black px-2 bg-gray-50">Saldo en Caja</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {monthlyTransactions.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400 italic">
                                No hay movimientos registrados en este mes.
                            </td>
                        </tr>
                    ) : (
                        monthlyTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="py-2 text-gray-600">
                                    {format(new Date(t.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="py-2 font-medium">
                                    {t.description}
                                    {t.beneficiary && <span className="block text-xs text-gray-500">{t.beneficiary}</span>}
                                </td>
                                <td className="py-2 text-right border-l border-gray-300 px-2 text-green-700">
                                    {t.type === 'income' ? `$${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                </td>
                                <td className="py-2 text-right border-l border-gray-300 px-2 text-red-700">
                                    {t.type === 'expense' ? `$${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                </td>
                                <td className="py-2 text-right border-l border-black px-2 font-mono font-bold bg-gray-50">
                                    ${t.balanceAfter.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                {/* Footer Totals for the Month (Optional context) */}
                <tfoot>
                    <tr className="border-t-2 border-black font-bold">
                        <td colSpan="2" className="py-3 text-right uppercase pr-4">Totales del Mes:</td>
                        <td className="py-3 text-right text-green-700 border-l border-gray-300 px-2">
                            ${monthlyTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right text-red-700 border-l border-gray-300 px-2">
                            ${monthlyTransactions.reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right border-l border-black px-2 bg-gray-50">
                            {/* Empty or end balance - User asked for "Saldo en caja" column, which is per row. The final row is the current balance. */}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Signature Area */}
            <div className="mt-16 grid grid-cols-2 gap-20">
                <div className="text-center border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">Tesorero/a</p>
                </div>
                <div className="text-center border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">Visto Bueno</p>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </div>
        </div>
    );
});

AccountSheet.displayName = 'AccountSheet';

export default AccountSheet;
