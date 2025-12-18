import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import StyledCard from '../Common/StyledCard';
import Receipt from '../Finance/Receipt';

export default function OfferingsView() {
    // Categories Configuration (Liturgical & Administrative)
    const categories = {
        income: [
            { id: 'colecta', label: 'Colecta Dominical' },
            { id: 'diezmo', label: 'Diezmos' },
            { id: 'donacion', label: 'Donaciones Específicas' },
            { id: 'eventos', label: 'Eventos / Ventas' },
            { id: 'misiones', label: 'Misiones' }
        ],
        expense: [
            { id: 'altar', label: 'Suministros Altar (Pan/Vino/Velas)' },
            { id: 'caridad', label: 'Caridad / Ayuda Social' },
            { id: 'mantenimiento', label: 'Mantenimiento Templo' },
            { id: 'papeleria', label: 'Papelería / Liturgia' },
            { id: 'servicios', label: 'Servicios Básicos' },
            { id: 'clero', label: 'Estipendios / Viáticos' }
        ]
    };

    // State for transactions - Init lazy to prevent overwrite
    const [transactions, setTransactions] = useState(() => {
        try {
            const stored = localStorage.getItem('liturgia_offerings');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'income',
        category: 'colecta',
        beneficiary: ''
    });

    const receiptRef = useRef(null);
    const [receiptData, setReceiptData] = useState(null);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('liturgia_offerings', JSON.stringify(transactions));
    }, [transactions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
        if (!formData.description || !formData.amount) return;

        const val = parseFloat(formData.amount);
        if (isNaN(val) || val <= 0) return;

        const newTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...formData,
            amount: val
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setFormData({ ...formData, description: '', amount: '', beneficiary: '' });
        setShowForm(false);
    };

    const handleDownloadReceipt = async (transaction) => {
        setReceiptData(transaction);
        // Wait for state update and render
        setTimeout(async () => {
            if (receiptRef.current) {
                try {
                    const dataUrl = await toPng(receiptRef.current, { quality: 0.95, pixelRatio: 2 });
                    saveAs(dataUrl, `Recibo_${transaction.id}.png`);
                } catch (err) {
                    console.error('Error generating receipt', err);
                    alert('Error al generar el recibo');
                } finally {
                    setReceiptData(null);
                }
            }
        }, 100);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    // Calculations
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <main className="flex-1 flex flex-col w-full h-full bg-gray-50 dark:bg-background-dark animate-fade-in overflow-hidden">

            {/* Header / Summary Section */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 p-6 shadow-sm z-10 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">savings</span>
                            Tesorería Litúrgica
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de ofrendas y necesidades del altar</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 justify-center"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Registrar Movimiento
                    </button>
                </div>

                {/* Financial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Income Card */}
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Entradas</span>
                        <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-300 mt-1">
                            ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Expense Card */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Salidas</span>
                        <div className="text-2xl font-mono font-bold text-red-700 dark:text-red-300 mt-1">
                            ${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className={`p-4 rounded-xl border ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance Actual</span>
                        <div className={`text-2xl font-mono font-bold mt-1 ${balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700'}`}>
                            ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Form Overlay (Mobile/Desktop) */}
            {showForm && (
                <div className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 p-4 animate-slide-down">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                        {/* Type Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: categories[e.target.value][0].id })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-black/20"
                            >
                                <option value="income">Entrada (+)</option>
                                <option value="expense">Salida (-)</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 p-2 pl-7 text-sm bg-white dark:bg-black/20"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Categoría</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-black/20"
                            >
                                {categories[formData.type].map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                            <input
                                type="text"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-black/20"
                                placeholder="Ej: Colecta Misa 10am"
                            />
                        </div>

                        {/* Beneficiary (Optional) */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                {formData.type === 'income' ? 'Recibido de' : 'Pagado a'}
                            </label>
                            <input
                                type="text"
                                value={formData.beneficiary}
                                onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-black/20"
                                placeholder={formData.type === 'income' ? 'Ej: Familia Pérez' : 'Ej: CFE'}
                            />
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-2 flex gap-2">
                            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-bold text-sm shadow-md transition-colors">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined text-lg pt-1">close</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ledger List */}
            <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
                {transactions.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_balance_wallet</span>
                        <p className="text-lg font-medium text-gray-500">No hay movimientos registrados</p>
                        <p className="text-sm text-gray-400">Comienza registrando la colecta del domingo.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-2">Fecha</div>
                            <div className="col-span-4">Descripción</div>
                            <div className="col-span-3">Categoría</div>
                            <div className="col-span-2 text-right">Monto</div>
                            <div className="col-span-1 text-center">Acción</div>
                        </div>

                        {transactions.map(t => (
                            <div key={t.id} className="group bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-center transition-all hover:shadow-md">
                                {/* Date */}
                                <div className="w-full md:col-span-2 flex items-center gap-2 text-gray-500 text-xs md:text-sm">
                                    <span className="material-symbols-outlined text-sm opacity-50">event</span>
                                    {format(new Date(t.date), 'd MMM yyyy', { locale: es })}
                                </div>

                                {/* Description */}
                                <div className="w-full md:col-span-4 font-medium text-gray-900 dark:text-white">
                                    {t.description}
                                </div>

                                {/* Category */}
                                <div className="w-full md:col-span-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                                        ${t.type === 'income'
                                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300'
                                            : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300'}
                                    `}>
                                        {categories[t.type].find(c => c.id === t.category)?.label || t.category}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className={`w-full md:col-span-2 text-lg md:text-base font-mono font-bold text-right
                                    ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}
                                `}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </div>

                                {/* Actions */}
                                <div className="w-full md:col-span-1 flex justify-end md:justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                                        title="Eliminar"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                    <button
                                        onClick={() => handleDownloadReceipt(t)}
                                        className="text-gray-400 hover:text-blue-500 p-1 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Descargar Recibo"
                                    >
                                        <span className="material-symbols-outlined">receipt</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden Receipt Container */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                {receiptData && <Receipt ref={receiptRef} data={receiptData} />}
            </div>
        </main>
    );
}
