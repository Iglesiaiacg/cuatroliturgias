import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, orderBy, limit, increment, setDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useFinanceSync(limitCount = 100) {
    const [transactions, setTransactions] = useState([]);
    const [globalBalance, setGlobalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const { currentUser, checkPermission, userRole } = useAuth();

    // 1. Sync Transactions List (Recent)
    useEffect(() => {
        const canView = currentUser && checkPermission && checkPermission('view_treasury');

        if (!canView) {
            setTransactions(prev => prev.length === 0 ? prev : []);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'transactions'),
            orderBy('date', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTransactions(list);
            setLoading(false);
        }, (error) => {
            console.error("Finance Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [limitCount, currentUser, checkPermission]); // removed userRole to reduce churn if unrelated

    // 2. Sync Global Balance (from finance/stats)
    useEffect(() => {
        const canView = currentUser && checkPermission && checkPermission('view_treasury');
        if (!canView) {
            setGlobalBalance(prev => prev === 0 ? prev : 0);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'finance', 'stats'), (doc) => {
            if (doc.exists()) {
                setGlobalBalance(doc.data().currentBalance || 0);
            } else {
                setGlobalBalance(0);
            }
        }, (error) => {
            if (error.code !== 'permission-denied') console.warn("Finance Stats Sync Error:", error);
        });
        return () => unsubscribe();
    }, [currentUser, checkPermission]);

    const addTransaction = async (transaction) => {
        try {
            const { id, ...data } = transaction;
            const amountVal = parseFloat(data.amount);
            const netAmount = data.type === 'income' ? amountVal : -amountVal;

            // 1. Add Doc
            await addDoc(collection(db, 'transactions'), {
                ...data,
                createdAt: new Date()
            });

            // 2. Update Global Balance (Atomic)
            await setDoc(doc(db, 'finance', 'stats'), {
                currentBalance: increment(netAmount),
                lastUpdated: new Date()
            }, { merge: true });

        } catch (e) {
            console.error("Error adding transaction:", e);
            throw e;
        }
    };

    const deleteTransaction = async (id, transactionData) => {
        try {
            // Need transactionData to know amount to reverse
            // Ideally we get it from the doc before deleting, but we pass it for efficiency if known
            let amountVal = 0;
            let type = 'income';

            if (transactionData) {
                amountVal = parseFloat(transactionData.amount);
                type = transactionData.type;
            } else {
                // Fetch if not provided (safety)
                const docSnap = await getDocs(query(collection(db, 'transactions'), where('__name__', '==', id)));
                if (!docSnap.empty) {
                    const data = docSnap.docs[0].data();
                    amountVal = parseFloat(data.amount);
                    type = data.type;
                }
            }

            const reverseAmount = type === 'income' ? -amountVal : amountVal;

            await deleteDoc(doc(db, 'transactions', id));

            await updateDoc(doc(db, 'finance', 'stats'), {
                currentBalance: increment(reverseAmount)
            });

        } catch (e) {
            console.error("Error deleting transaction:", e);
            throw e;
        }
    };

    // Maintenance: Recalculate Balance from Full History
    const recalculateBalance = useCallback(async () => {
        if (userRole !== 'admin') return; // Security check
        try {
            setLoading(true);
            const q = query(collection(db, 'transactions'));
            const snapshot = await getDocs(q);

            let total = 0;
            snapshot.forEach(doc => {
                const d = doc.data();
                const amt = parseFloat(d.amount || 0);
                total += (d.type === 'income' ? amt : -amt);
            });

            await setDoc(doc(db, 'finance', 'stats'), {
                currentBalance: total,
                lastCalibrated: new Date()
            }, { merge: true });

            setLoading(false);
            return total;
        } catch (e) {
            if (e.code === 'permission-denied') {
                console.warn("Calibration blocked: Insufficient permissions.");
            } else {
                console.error("Calibration failed:", e);
            }
            setLoading(false);
            throw e;
        }
    }, [userRole]);

    return {
        transactions,
        globalBalance,
        addTransaction,
        deleteTransaction,
        recalculateBalance,
        loading
    };
}
