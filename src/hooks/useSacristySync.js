import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

const defaultItems = [
    // Libros
    { id: 'misal', label: 'Misal', checked: false },
    { id: 'leccionario', label: 'Leccionario', checked: false },
    { id: 'evangeliario', label: 'Evangeliario', checked: false },
    { id: 'guion', label: 'Guión / Oración Fieles', checked: false },

    // Altar y Credencia - Vasos
    { id: 'caliz', label: 'Cáliz y Patena', checked: false },
    { id: 'copon', label: 'Copón (si es necesario)', checked: false },
    { id: 'vinajeras', label: 'Vinajeras (Vino/Agua)', checked: false },
    { id: 'lavabo', label: 'Jarra y Jofaina (Lavabo)', checked: false },

    // Altar y Credencia - Lencería
    { id: 'corporal', label: 'Corporal y Purificador', checked: false },
    { id: 'manutergio', label: 'Manutergio', checked: false },
    { id: 'manteles', label: 'Manteles de Altar', checked: false },

    // Elementos
    { id: 'pan', label: 'Hostias (Suficientes)', checked: false },
    { id: 'velas', label: 'Velas del Altar', checked: false },
    { id: 'llaves', label: 'Llave del Sagrario', checked: false },

    // Procesión y Ritos
    { id: 'cruz', label: 'Cruz Alta / Ciriales', checked: false },
    { id: 'incensario', label: 'Incensario y Naveta', checked: false },
    { id: 'carbones', label: 'Carbones / Incienso', checked: false },
    { id: 'acetre', label: 'Acetre e Hisopo (Agua)', checked: false },
    { id: 'campanilla', label: 'Campanilla', checked: false },

    // Vestiduras
    { id: 'vestiduras', label: 'Vestiduras (Color)', checked: false },
    { id: 'micro', label: 'Micrófono / Sonido', checked: false },
];

export function useSacristySync(date) {
    const [items, setItems] = useState(defaultItems);
    const [loading, setLoading] = useState(true);

    const { currentUser, checkPermission } = useAuth();
    const dateKey = format(date, 'yyyy-MM-dd');

    useEffect(() => {
        const canView = currentUser && checkPermission && checkPermission('view_sacristy');

        if (!canView) {
            setItems(prev => prev === defaultItems ? prev : defaultItems);
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'sacristy_checks', dateKey);

        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists() && snap.data().items) {
                setItems(snap.data().items);
            } else {
                // Keep default if doesn't exist yet
                setItems(defaultItems);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dateKey, currentUser, checkPermission]);

    const toggleItem = async (id) => {
        // Optimistic update
        const newItems = items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        setItems(newItems);

        try {
            const docRef = doc(db, 'sacristy_checks', dateKey);
            await setDoc(docRef, { items: newItems, date: dateKey, updatedAt: new Date() }, { merge: true });
        } catch (error) {
            console.error("Error updating item:", error);
            // Revert on error could be implemented here
        }
    };

    return { items, toggleItem, loading };
}
