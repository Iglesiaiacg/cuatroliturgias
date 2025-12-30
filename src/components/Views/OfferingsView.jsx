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
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function OfferingsView() {
    const formRef = useRef(null);
    // Categories imported from utils
    const { currentUser, userRole, checkPermission } = useAuth();


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

    const [bankSettings, setBankSettings] = useState({
        account: '0123456789',
        clabe: '012345678901234567',
        beneficiary: 'Iglesia Anglicana Comunidad de Gracia'
    });

    // Sync Bank Settings
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'config', 'bank_details'), (docSnap) => {
            if (docSnap.exists()) {
                setBankSettings(docSnap.data());
            }
        });
        return () => unsub();
    }, []);

    const updateBankSettings = async (newData) => {
        try {
            await setDoc(doc(db, 'config', 'bank_details'), {
                ...newData,
                updatedAt: new Date(),
                updatedBy: currentUser?.email
            }, { merge: true });
        } catch (e) {
            console.error("Error updating bank details:", e);
            throw e;
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

    const summary = {
        income: totalIncome,
        expense: totalExpense,
        balance: balance
    };

    const formatMoney = (amount) => {
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // ROLE CHECK: If not manager, show GUEST DONATION VIEW
    const canManage = userRole === 'admin' || (checkPermission && checkPermission('manage_treasury'));

    // View Mode State (Defaults to manager if permissible, else guest)
    const [viewMode, setViewMode] = useState(canManage ? 'manager' : 'guest');

    if (viewMode === 'guest') {
        return (
            <DigitalOfferingCard
                showBack={canManage}
                onBack={() => setViewMode('manager')}
                settings={bankSettings}
                onUpdate={updateBankSettings}
                isAdmin={userRole === 'admin'}
            />
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
                            {/* TOGGLE TO GUEST VIEW */}
                            <button
                                onClick={() => setViewMode('guest')}
                                className="px-3 py-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                                title="Información de donación"
                            >
                                <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
                                <span className="hidden sm:inline">Ofrenda de amor</span>
                            </button>

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

                    <FinancialCards
                        summary={summary}
                        formatMoney={formatMoney}
                        currentDate={currentDate}
                    />
                </div>

                {/* Main Content Area */}
                <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Entry Form */}
                    {showForm && (
                        <div className="lg:col-span-2 animate-slide-in">
                            <form
                                ref={formRef}
                                onSubmit={handleAddTransaction}
                                className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group"
                            >
                                {/* Form content remains same, extracted or inline? Inline is fine for now as logic is simple */}
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-primary">post_add</span>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Registrar Movimiento
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-gray-500">close</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Type */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Tipo de Movimiento</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all p-3 text-center ${formData.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="income"
                                                    checked={formData.type === 'income'}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <div className="relative z-10 flex flex-col items-center gap-1">
                                                    <span className="material-symbols-outlined">arrow_upward</span>
                                                    <span className="font-bold text-sm">Ingreso</span>
                                                </div>
                                            </label>
                                            <label className={`flex-1 cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all p-3 text-center ${formData.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-red-200'}`}>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="expense"
                                                    checked={formData.type === 'expense'}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <div className="relative z-10 flex flex-col items-center gap-1">
                                                    <span className="material-symbols-outlined">arrow_downward</span>
                                                    <span className="font-bold text-sm">Egreso</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Monto</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono font-bold text-lg"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Concepto / Categoría</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                                            required
                                        >
                                            <option value="" disabled>Seleccionar Categoría</option>
                                            {categories[formData.type].map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Fecha</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Notas / Descripción (Opcional)</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Detalles adicionales..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary px-8"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">save</span>
                                                Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Transactions List */}
                    <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-stone-800 flex items-center justify-between bg-gray-50/50 dark:bg-stone-800/50">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Movimientos Recientes</h3>
                                <span className="text-xs font-mono text-gray-400">
                                    {transactions.filter(t => {
                                        if (!t.date) return false;
                                        const d = t.date.toDate ? t.date.toDate() : new Date(t.date);
                                        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                                    }).length} total
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-stone-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {transactions
                                    .filter(t => {
                                        if (!t.date) return false;
                                        const d = t.date.toDate ? t.date.toDate() : new Date(t.date);
                                        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                                    })
                                    .length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl opacity-20">receipt_long</span>
                                        <p>No hay movimientos este mes</p>
                                    </div>
                                ) : (
                                    transactions
                                        .filter(t => {
                                            if (!t.date) return false;
                                            const d = t.date.toDate ? t.date.toDate() : new Date(t.date);
                                            return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                                        })
                                        .map((t) => (
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
                                                    {(userRole === 'admin' || (checkPermission && checkPermission('manage_treasury'))) && (
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {t.type === 'income' && (
                                                                <button
                                                                    onClick={() => handleDownloadReceipt(t)}
                                                                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                                    title="Descargar Recibo"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">receipt</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(t.id)}
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
                </div>
            </div>

            {/* Print Sheet (Hidden on Screen) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                <AccountSheet
                    transactions={transactions}
                    currentMonth={currentDate.getMonth()}
                    currentYear={currentDate.getFullYear()}
                />
            </div>
        </main>
    );
}

// --- SUB-COMPONENTS ---

function FinancialCards({ summary, formatMoney, currentDate }) {
    // ... existing FinancialCards logic (if previously extracted, else I need to ensure it wasn't lost)
    // Wait, the FinancialCards logic was inline in previous code but I used <FinancialCards ... /> in my replacement above.
    // I need to make sure I define it or put the code back inline. 
    // Looking at file content, FinancialCards was NOT previously extracted. It was inline.
    // SO I MUST DEFINE IT NOW or put the inline code back. 
    // I replaced the inline code with <FinancialCards>. So I need to add the function definition below.
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="neumorphic-card p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-stone-800 dark:to-stone-900 border-l-4 border-l-blue-500">
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

function CopyableText({ text }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        // Simple toast or feedback could go here
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors group"
            title="Copiar"
        >
            <span className="font-mono font-bold select-all">{text}</span>
            <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
        </button>
    );
}

function DigitalOfferingCard({ showBack, onBack, settings, onUpdate, isAdmin }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(settings);
    const [saving, setSaving] = useState(false);

    // Update edit form when settings change externally
    useEffect(() => {
        setEditForm(settings);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate(editForm);
            setIsEditing(false);
        } catch (e) {
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-4 pt-2 overflow-y-auto no-scrollbar animate-fade-in w-full max-w-md mx-auto relative h-full">
            <div className="w-full flex justify-between items-center mb-4">
                {showBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver a Tesorería
                    </button>
                ) : <div />}

                {isAdmin && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isEditing ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                        {isEditing ? 'Cancelar' : 'Editar Datos'}
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 flex-shrink-0 mb-32 animate-slide-in">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">settings</span>
                        Configurar Ofrenda
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cuenta</label>
                            <input
                                type="text"
                                value={editForm.account}
                                onChange={(e) => setEditForm({ ...editForm, account: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="Número de cuenta (10 dígitos)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CLABE</label>
                            <input
                                type="text"
                                value={editForm.clabe}
                                onChange={(e) => setEditForm({ ...editForm, clabe: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="CLABE Interbancaria (18 dígitos)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Beneficiario</label>
                            <input
                                type="text"
                                value={editForm.beneficiary}
                                onChange={(e) => setEditForm({ ...editForm, beneficiary: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="Nombre de la Institución/Cuenta"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full btn-primary bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 justify-center text-sm mt-4 shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden relative flex-shrink-0 mb-32">
                    {/* Decorative Header */}
                    <div className="h-28 bg-gradient-to-br from-amber-500 to-amber-700 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg animate-pulse-slow">volunteer_activism</span>
                    </div>

                    <div className="p-6 text-center relative">
                        {/* Avatar/Logo overlapping */}
                        <div className="w-14 h-14 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg absolute -top-7 left-1/2 -translate-x-1/2 border-2 border-white dark:border-stone-800">
                            <span className="material-symbols-outlined text-amber-600 text-2xl">church</span>
                        </div>

                        <h2 className="mt-8 text-xl font-display font-bold text-gray-900 dark:text-white mb-1">Ofrenda Digital</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                            "Dios ama al dador alegre."<br /><span className="text-[10px] italic">- 2 Corintios 9:7</span>
                        </p>

                        <div className="space-y-3 text-left">
                            {/* Bank Details */}
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Transferencia / Depósito</p>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">BBVA Bancomer</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 ml-11">
                                    <p className="text-sm flex justify-between gap-4">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Cuenta:</span>
                                        <CopyableText text={settings.account} />
                                    </p>
                                    <p className="text-sm flex justify-between gap-4">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">CLABE:</span>
                                        <CopyableText text={settings.clabe} />
                                    </p>
                                    <p className="text-sm flex flex-col items-end">
                                        <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold w-full text-left">Beneficiario:</span>
                                        <span className="font-medium text-right text-gray-900 dark:text-white leading-tight">{settings.beneficiary}</span>
                                    </p>
                                </div>
                            </div>

                            {/* QR Instructions */}
                            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                <div className="qr-placeholder w-16 h-16 bg-white p-1 rounded-lg shrink-0 shadow-sm">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${settings.clabe}`} alt="QR Bancario" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-tight">
                                    Escanea este código desde tu App Bancaria para donar rápidamente.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button className="btn-secondary w-full justify-center text-xs py-2.5 rounded-2xl">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    Compartir
                                </button>
                                <button className="btn-primary w-full justify-center text-xs py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white border-none shadow-green-200 dark:shadow-none">
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    Reportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
