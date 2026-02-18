import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const defaultItems = [
    { id: 'hostias', label: 'Hostias', status: 'ok' },
    { id: 'vino', label: 'Vino de Consagrar', status: 'ok' },
    { id: 'velas', label: 'Velas', status: 'warning' },
    { id: 'incienso', label: 'Incienso / Carbones', status: 'ok' },
    { id: 'aceite', label: 'Aceite de Lámparas', status: 'ok' },
];

export function useInventorySync() {
    const [items, setItems] = useState(defaultItems);
    const [loading, setLoading] = useState(true);

    const { currentUser, checkPermission, userRole } = useAuth();

    // Using a single document for all inventory for simplicity in this MVP
    // collection: 'inventory', doc: 'sacristy_main'
    const docRef = doc(db, 'inventory', 'sacristy_main');

    const initializeInventory = async () => {
        try {
            await setDoc(docRef, { items: defaultItems, updatedAt: new Date() });
        } catch (e) {
            console.error("Error initializing inventory:", e);
        }
    };

    useEffect(() => {
        if (!currentUser || !checkPermission || !checkPermission('view_sacristy')) {
            setItems(defaultItems);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setItems(snap.data().items);
            } else {
                // Initialize if doesn't exist
                initializeInventory();
            }
            setLoading(false);
        }, (error) => {
            console.error("Inventory Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, checkPermission, userRole]);



    const toggleStatus = async (id) => {
        // Optimistic update
        const strategies = {
            'ok': 'warning',
            'warning': 'critical',
            'critical': 'ok'
        };

        const newItems = items.map(item =>
            item.id === id ? { ...item, status: strategies[item.status] } : item
        );

        setItems(newItems);

        try {
            await setDoc(docRef, { items: newItems, updatedAt: new Date() }, { merge: true });
        } catch (error) {
            console.error("Error updating inventory:", error);
        }
    };

    return { items, toggleStatus, loading };
}
