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
    const formRef = useRef(null);
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
            // Calendar logic
            const today = new Date();
            const candidates = [];
            for (let i = -7; i <= 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const dayEvents = getEventsForDate(d);
                dayEvents.forEach(e => {
                    if (e.type !== 'finance' && !e.isAuto) {
                        candidates.push({
                            ...e,
                            uniqueId: e.id + d.toISOString(),
                            displayDate: d
                        });
                    }
                });
            }
            setRecentEvents(candidates);

            // Auto-scroll to form on mobile
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
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

    // ROLE CHECK: If not manager, show GUEST DONATION VIEW
    const canManage = userRole === 'admin' || (checkPermission && checkPermission('manage_treasury'));

    if (!canManage) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in w-full max-w-md mx-auto pb-40">
                <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden relative">
                    {/* Decorative Header */}
                    <div className="h-32 bg-gradient-to-br from-amber-500 to-amber-700 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <span className="material-symbols-outlined text-white text-6xl drop-shadow-lg animate-pulse-slow">volunteer_activism</span>
                    </div>

                    <div className="p-8 text-center relative">
                        {/* Avatar/Logo overlapping */}
                        <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg absolute -top-8 left-1/2 -translate-x-1/2 border-4 border-white dark:border-stone-800">
                            <span className="material-symbols-outlined text-amber-600 text-3xl">church</span>
                        </div>

                        <h2 className="mt-8 text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Ofrenda Digital</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            "Dios ama al dador alegre."<br /><span className="text-xs italic">- 2 Corintios 9:7</span>
                        </p>

                        <div className="space-y-4 text-left">
                            {/* Bank Details */}
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Transferencia / Depósito</p>
                                        <p className="font-bold text-gray-900 dark:text-white">BBVA Bancomer</p>
                                    </div>
                                </div>
                                <div className="space-y-1 ml-11">
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Cuenta:</span>
                                        <CopyableText text="0123456789" />
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">CLABE:</span>
                                        <CopyableText text="012345678901234567" />
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Beneficiario:</span>
                                        <span className="font-medium text-right">Iglesia Anglocatólica</span>
                                    </p>
                                </div>
                            </div>

                            {/* QR Instructions */}
                            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                <div className="qr-placeholder w-16 h-16 bg-white p-1 rounded-lg shrink-0">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=012345678901234567`} alt="QR Bancario" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-200 leading-tight">
                                    Escanea este código desde tu App Bancaria para donar rápidamente.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button className="btn-secondary w-full justify-center text-xs py-3">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    Compartir
                                </button>
                                <button className="btn-primary w-full justify-center text-xs py-3 bg-green-600 hover:bg-green-700 text-white border-none shadow-green-200 dark:shadow-none">
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    Reportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // --- MANAGER VIEW (Existing Dashboard) ---
    return (
        <main className="flex-1 flex flex-col w-full min-h-0 animate-fade-in">

            {/* Main Content (Hidden on Print) */}
            <div className="flex-1 w-full print:hidden overflow-y-auto pb-40">
                {/* Header / Summary Section */}
                <div className="p-4 md:p-6 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">savings</span>
                                Tesorería Litúrgica
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-500">Gestión de ofrendas y necesidades del altar</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                            <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-lg p-1">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="px-2 md:px-3 font-bold text-sm min-w-[100px] md:min-w-[120px] text-center capitalize">
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
                        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Entradas</span>
                            <div className="text-3xl font-mono font-bold text-green-700 dark:text-green-400">
                                ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Salidas</span>
                            <div className="text-3xl font-mono font-bold text-red-700 dark:text-red-400">
                                ${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="col-span-2 md:col-span-1 bg-[var(--bg-card)] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Balance Actual</span>
                            <div className={`text-3xl font-mono font-bold ${balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div >

                <div className="px-4 max-w-6xl mx-auto w-full">
                    {/* Input Form Overlay (Mobile/Desktop) - Moved inside scrollable area */}
                    {showForm && (
                        <div ref={formRef} className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 p-6 overflow-y-auto md:static md:z-auto md:bg-gray-100 md:dark:bg-white/5 md:p-4 md:mb-6 md:rounded-xl md:border md:border-gray-200 md:dark:border-white/10 animate-fade-in">
                            <div className="flex items-center justify-between mb-6 md:hidden">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">add_circle</span>
                                    Nueva Transacción
                                </h3>
                                <button type="button" onClick={() => setShowForm(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-end pb-20 md:pb-0">
                                {/* Type Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Tipo</label>
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
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Monto</label>
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
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Categoría</label>
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
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Vincular Evento (Opcional)</label>
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
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Descripción</label>
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

                    <div className="bg-[var(--bg-card)] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
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
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                    {format(new Date(t.date), 'dd/MM/yyyy', { locale: es })}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {t.description}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
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
                                        <div key={t.id} className="p-4 space-y-3 bg-[var(--bg-card)]">
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
                    </div >

                </div >
            </div >
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

// Simple Copy Component
function CopyableText({ text }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        alert("Copiado al portapapeles");
    };
    return (
        <button onClick={handleCopy} className="flex items-center gap-2 font-mono text-gray-900 dark:text-white hover:text-primary transition-colors">
            {text}
            <span className="material-symbols-outlined text-[10px] opacity-50">content_copy</span>
        </button>
    );
}
