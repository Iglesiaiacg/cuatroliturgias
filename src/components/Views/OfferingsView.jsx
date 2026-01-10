import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Receipt from '../Finance/Receipt';
import AccountSheet from '../Finance/AccountSheet';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useFinanceSync } from '../../hooks/useFinanceSync';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// New Components
import DigitalOfferingCard from '../Finance/DigitalOfferingCard';
import TransactionForm from '../Finance/TransactionForm';
import TransactionList from '../Finance/TransactionList';
import FinancialCards from '../Finance/FinancialCards';

export default function OfferingsView() {
    const { currentUser, userRole, checkPermission } = useAuth();

    // Real-time Finance Sync
    const { transactions, addTransaction, deleteTransaction, loading: loadingTransactions } = useFinanceSync(200);

    // Month/Year Selection for Sheet
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'income',
        category: 'colecta',
        beneficiary: '',
        eventId: '',
        eventTitle: '',
        date: new Date().toISOString().split('T')[0] // Initialize with today's date
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
        }
    }, [showForm, getEventsForDate]);

    const receiptRef = useRef(null);
    const [receiptData, setReceiptData] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

        setLoading(true);

        // Ensure date is set correctly (if user didn't change it, it's string YYYY-MM-DD from initial state)
        // If it's empty, default to now.
        const txDate = formData.date ? new Date(formData.date) : new Date();

        const newTransaction = {
            ...formData,
            // Re-assign date as ISO string at specific time (now) but with user's selected YYYY-MM-DD
            // Actually, best to just use the date string or construct a date object.
            // Firestore expects timestamp or we store ISO string. The app seems to use ISO string in formData but converts to Date often.
            // Let's store ISO string compatible with existing system.
            date: txDate.toISOString(),
            amount: val
        };

        try {
            await addTransaction(newTransaction);
            setFormData({ ...formData, description: '', amount: '', beneficiary: '' });
            setShowForm(false);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error al guardar. Permiso denegado o error de red.");
        } finally {
            setLoading(false);
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
        // Find transaction to pass to delete logic (needed for balance reversal)
        const tx = transactions.find(t => t.id === id);
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
            deleteTransaction(id, tx);
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
        }, (error) => {
            console.warn("Bank Details Sync Error:", error);
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
                                className="px-3 py-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 !text-white"
                                title="Información de donación"
                            >
                                <span className="material-symbols-outlined text-[18px] !text-white">volunteer_activism</span>
                                <span className="hidden sm:inline !text-white">Ofrenda de amor</span>
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
                                    className="btn-primary !text-white"
                                >
                                    <span className="material-symbols-outlined text-lg !text-white">add_circle</span>
                                    <span className="hidden sm:inline !text-white">Nuevo</span>
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
                        <TransactionForm
                            formData={formData}
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowForm(false)}
                            loading={loading}
                        />
                    )}

                    {/* Transactions List */}
                    <TransactionList
                        transactions={transactions}
                        currentDate={currentDate}
                        formatMoney={formatMoney}
                        onDownloadReceipt={handleDownloadReceipt}
                        onDelete={handleDelete}
                        userRole={userRole}
                        checkPermission={checkPermission}
                    />
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

            {/* Hidden Receipt Generator */}
            <div className="absolute top-0 left-[-9999px] invisible">
                {receiptData && (
                    <Receipt
                        ref={receiptRef}
                        data={receiptData}
                    />
                )}
            </div>
        </main >
    );
}
