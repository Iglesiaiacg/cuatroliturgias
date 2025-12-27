import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import StyledCard from '../Common/StyledCard';
import Receipt from '../Finance/Receipt';
import AccountSheet from '../Finance/AccountSheet';
import { FINANCE_CATEGORIES as categories } from '../../utils/financeCategories';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useFinanceSync } from '../../hooks/useFinanceSync';

export default function OfferingsView() {
    // Categories imported from utils
    const { userRole, checkPermission } = useAuth();


    // State for transactions - Init lazy to prevent overwrite
    // Real-time Finance Sync
    const { transactions, addTransaction, deleteTransaction, loading: loadingTransactions } = useFinanceSync(200);

    // Month/Year Selection for Sheet
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'income',
        category: 'colecta',
        beneficiary: '',
        eventId: '',
        eventTitle: ''
    });

    // Calendar Integration
    const { getEventsForDate } = useCalendarEvents();
    const [recentEvents, setRecentEvents] = useState([]);

    // Load recent/upcoming events for dropdown (last 7 days + next 7 days)
    useEffect(() => {
        if (showForm) {
            const today = new Date();
            const candidates = [];
            // Check range from -7 days to +7 days
            for (let i = -7; i <= 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const dayEvents = getEventsForDate(d);
                dayEvents.forEach(e => {
                    // Filter out auto-generated finance tasks to avoid recursion, keep liturgies
                    if (e.type !== 'finance' && !e.isAuto) {
                        candidates.push({
                            ...e,
                            uniqueId: e.id + d.toISOString(), // Ensure unique key for dropdown
                            displayDate: d
                        });
                    }
                });
            }
            setRecentEvents(candidates);
        }
    }, [showForm, getEventsForDate]);

    const receiptRef = useRef(null);
    const [receiptData, setReceiptData] = useState(null);

    // Save to local storage on change


    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation
        if (!formData.description || !formData.amount) {
            alert("Por favor completa la descripción y el monto.");
            return;
        }

        const val = parseFloat(formData.amount);
        if (isNaN(val) || val <= 0) {
            alert("El monto debe ser un número positivo.");
            return;
        }

        const newTransaction = {
            date: new Date().toISOString(),
            ...formData,
            amount: val
        };

        try {
            await addTransaction(newTransaction);
            setFormData({ ...formData, description: '', amount: '', beneficiary: '' });
            setShowForm(false);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error al guardar. Permiso denegado o error de red.");
        }
    };

    const handleDownloadReceipt = async (transaction) => {
        setReceiptData(transaction);
        // Wait for state update and render
        setTimeout(async () => {
            if (receiptRef.current) {
                try {
                    const dataUrl = await toPng(receiptRef.current, {
                        quality: 1.0,
                        pixelRatio: 2,
                        skipFonts: true // Bypass CORS issues with external fonts
                    });

                    // A5 Landscape: 210mm x 148mm
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: 'a5'
                    });

                    const imgProps = pdf.getImageProperties(dataUrl);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    const y = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

                    pdf.addImage(dataUrl, 'PNG', 0, y > 0 ? y : 0, pdfWidth, pdfHeight);
                    pdf.save(`Recibo_${transaction.id}.pdf`);

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
            if (window.confirm('¿Estás seguro de eliminar este registro?')) {
                deleteTransaction(id);
            }
        }
    };

    const handlePrintSheet = () => {
        window.print();
    };

    // Month Navigation
    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
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
        <main className="flex-1 flex flex-col w-full h-full animate-fade-in overflow-hidden">

            {/* Main Content (Hidden on Print) */}
            <div className="flex flex-col w-full h-full print:hidden">
                {/* Header / Summary Section */}
                <div className="p-4 md:p-6 shrink-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">savings</span>
                                Tesorería Litúrgica
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-500">Gestión de ofrendas y necesidades del altar</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-lg p-1">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="px-3 font-bold text-sm min-w-[120px] text-center capitalize">
                                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                                </span>
                                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>

                            <button
                                onClick={handlePrintSheet}
                                className="btn-secondary"
                                title="Imprimir Hoja Mensual"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                <span className="hidden sm:inline">Hoja Mensual</span>
                            </button>

                            {(userRole === 'admin' || (checkPermission && checkPermission('manage_treasury'))) && (
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="btn-primary"
                                >
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    <span className="hidden sm:inline">Nuevo</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Financial Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {/* Income Card */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Entradas</span>
                            <div className="text-3xl font-mono font-bold text-green-700 dark:text-green-400">
                                ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Salidas</span>
                            <div className="text-3xl font-mono font-bold text-red-700 dark:text-red-400">
                                ${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="col-span-2 md:col-span-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Balance Actual</span>
                            <div className={`text-3xl font-mono font-bold ${balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div >

                {/* Input Form Overlay (Mobile/Desktop) */}
                {/* Form moved inside scrollable area */}


                <div className="flex-1 overflow-y-auto px-4 pb-32 max-w-6xl mx-auto w-full">
                    {/* Input Form Overlay (Mobile/Desktop) - Moved inside scrollable area */}
                    {showForm && (
                        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-6 animate-slide-down">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                {/* Type Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value, category: categories[e.target.value][0].id })}
                                        className="w-full neumorphic-inset p-2 text-sm bg-transparent"
                                    >
                                        <option value="income">Entrada (+)</option>
                                        <option value="expense">Salida (-)</option>
                                    </select>
                                </div>
                                {/* Amount */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Monto</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
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
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full neumorphic-inset p-2 text-sm bg-transparent"
                                    >
                                        {categories[formData.type].map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Link Event */}
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Vincular Evento (Opcional)</label>
                                    <select
                                        value={formData.uniqueId || ''}
                                        onChange={(e) => {
                                            const selected = recentEvents.find(ev => ev.uniqueId === e.target.value);
                                            if (selected) {
                                                setFormData({
                                                    ...formData,
                                                    eventId: selected.id,
                                                    eventTitle: selected.title,
                                                    uniqueId: selected.uniqueId,
                                                    description: formData.description || selected.title // Auto-fill desc if empty
                                                });
                                            } else {
                                                setFormData({ ...formData, eventId: '', eventTitle: '', uniqueId: '' });
                                            }
                                        }}
                                        className="w-full neumorphic-inset p-2 text-sm bg-transparent"
                                    >
                                        <option value="">-- Ninguno --</option>
                                        {recentEvents.map(ev => (
                                            <option key={ev.uniqueId} value={ev.uniqueId}>
                                                {format(new Date(ev.displayDate), 'dd/MM')} - {ev.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Description */}
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full neumorphic-inset p-2 text-sm bg-transparent"
                                        placeholder="Ej: Colecta Misa 10am"
                                    />
                                </div>
                                {/* Beneficiary (Optional) */}
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                        {formData.type === 'income' ? 'Recibido de' : 'Pagado a'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.beneficiary}
                                        onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                                        className="w-full neumorphic-inset p-2 text-sm bg-transparent"
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

                    <div className="bg-white dark:bg-surface-dark shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                        {transactions.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_balance_wallet</span>
                                <p className="text-lg font-medium text-gray-600">No hay movimientos registrados</p>
                                <p className="text-sm text-gray-500">Comienza registrando la colecta del domingo.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Desktop Table */}
                                <table className="w-full text-sm text-left hidden md:table">
                                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-black/20 dark:text-gray-500 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 font-bold tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 font-bold tracking-wider">Descripción</th>
                                            <th className="px-6 py-3 font-bold tracking-wider">Beneficiario/Origen</th>
                                            <th className="px-6 py-3 font-bold tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 font-bold tracking-wider text-right">Monto</th>
                                            <th className="px-6 py-3 font-bold tracking-wider text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {format(new Date(t.date), 'dd/MM/yyyy', { locale: es })}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {t.description}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {t.beneficiary || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                                                        ${t.type === 'income'
                                                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300'
                                                            : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300'}
                                                    `}>
                                                        {categories[t.type].find(c => c.id === t.category)?.label || t.category}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleDownloadReceipt(t)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Descargar Recibo"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">receipt_long</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(t.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Mobile Card List */}
                                <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                                    {transactions.map((t) => (
                                        <div key={t.id} className="p-4 space-y-3 bg-white dark:bg-surface-dark">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">
                                                        {format(new Date(t.date), 'dd MMMM yyyy', { locale: es })}
                                                    </div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                        {t.description}
                                                    </div>
                                                    {t.beneficiary && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            Ref: {t.beneficiary}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`font-mono font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase border
                                                    ${t.type === 'income'
                                                        ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300'
                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300'}
                                                `}>
                                                    {categories[t.type].find(c => c.id === t.category)?.label || t.category}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleDownloadReceipt(t)}
                                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="btn-danger p-1 aspect-square flex items-center justify-center !rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Hidden Receipt Container (For PDF generation) */}
            < div style={{ position: 'absolute', top: -9999, left: -9999 }
            }>
                {receiptData && <Receipt ref={receiptRef} data={receiptData} />}
            </div >

            {/* Account Sheet (For Printing Only) */}
            < div className="hidden print:block" >
                <AccountSheet
                    transactions={transactions}
                    currentMonth={currentDate.getMonth()}
                    currentYear={currentDate.getFullYear()}
                />
            </div >
        </main >
    );
}
