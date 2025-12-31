import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

export function useIntentionsSync(date) {
    const [intentions, setIntentions] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentUser, checkPermission, userRole } = useAuth();

    // Using dateKey in dependancy array is fine
    const dateKey = format(date || new Date(), 'yyyy-MM-dd');

    // ALLOW ALL ROLES to use the hook (for adding), but restricting VIEWING to privileged roles.
    useEffect(() => {
        // PERMISSION CHECK: Only Admin, Priest, Sacristan, Secretary can VIEW the list.
        // Guests/Faithful can only ADD (so they get an empty list here).
        const canView = userRole === 'admin' || userRole === 'priest' || checkPermission('view_directory') || checkPermission('manage_sacristy');

        if (!currentUser || !canView) {
            setIntentions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'intentions', dateKey);

        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setIntentions(snap.data().list || []);
            } else {
                setIntentions([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Intentions Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dateKey, currentUser, checkPermission, userRole]);

    const addIntention = async (text, type = 'general') => {
        const newIntention = {
            id: Date.now(),
            text,
            type,
            completed: false,
            requestedBy: currentUser?.displayName || currentUser?.email || 'Anónimo',
            createdAt: new Date().toISOString()
        };
        const newList = [...intentions, newIntention];
        setIntentions(newList); // Optimistic

        try {
            const docRef = doc(db, 'intentions', dateKey);
            await setDoc(docRef, { list: newList, date: dateKey }, { merge: true });
        } catch (e) {
            console.error("Error adding intention:", e);
        }
    };

    const removeIntention = async (id) => {
        const newList = intentions.filter(i => i.id !== id);
        setIntentions(newList);

        try {
            const docRef = doc(db, 'intentions', dateKey);
            await setDoc(docRef, { list: newList }, { merge: true });
        } catch (e) {
            console.error("Error removing intention:", e);
        }
    };

    // Optional: Toggle completion if we want to mark them as 'read'
    const toggleIntention = async (id) => {
        const newList = intentions.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
        setIntentions(newList);
        try {
            const docRef = doc(db, 'intentions', dateKey);
            await setDoc(docRef, { list: newList }, { merge: true });
        } catch (e) {
            console.error("Error toggling intention:", e);
        }
    }

    return { intentions, addIntention, removeIntention, toggleIntention, loading };
}
