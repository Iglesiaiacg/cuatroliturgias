import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useFinanceSync(limitCount = 100) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth(); // Assume we can import useAuth, wait, I need to import it.

    useEffect(() => {
        if (!currentUser) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Query transactions ordered by date descending
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
    }, [limitCount, currentUser]);

    const addTransaction = async (transaction) => {
        // Optimistic update not needed as listener is fast, 
        // but can be added if offline support is required.
        try {
            // Remove id if it exists (let Firestore generate it) or use it if we want custom IDs
            // We'll let firestore generate proper IDs for documents
            const { id, ...data } = transaction;
            await addDoc(collection(db, 'transactions'), {
                ...data,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding transaction:", e);
            throw e;
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await deleteDoc(doc(db, 'transactions', id));
        } catch (e) {
            console.error("Error deleting transaction:", e);
            throw e;
        }
    };

    // Optional: Update capability
    const updateTransaction = async (id, data) => {
        try {
            await updateDoc(doc(db, 'transactions', id), data);
        } catch (e) {
            console.error("Error updating transaction:", e);
            throw e;
        }
    }

    return { transactions, addTransaction, deleteTransaction, updateTransaction, loading };
}
