import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useNoticesSync() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentUser } = useAuth();

    // Single doc for notices as they are usually "current"
    // We could date them, but usually they are "for the week"
    const docId = 'current_notices';

    useEffect(() => {
        if (!currentUser) {
            setNotices([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'content', docId);

        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setNotices(snap.data().list || []);
            } else {
                setNotices([]);
            }
            setLoading(false);
        }, (error) => {
        }, (error) => {
            // Gracefully handle permission errors (e.g., for Guests if rules deny access)
            console.warn("Notices Sync skipped (permissions or offline).");
            setNotices([]); // Safe fallback
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addNotice = async (text) => {
        const newNotice = { id: Date.now(), text };
        const newList = [...notices, newNotice];
        setNotices(newList); // Optimistic

        try {
            const docRef = doc(db, 'content', docId);
            await setDoc(docRef, { list: newList, updatedAt: new Date() }, { merge: true });
        } catch (e) {
            console.error("Error adding notice:", e);
        }
    };

    const removeNotice = async (id) => {
        const newList = notices.filter(i => i.id !== id);
        setNotices(newList);

        try {
            const docRef = doc(db, 'content', docId);
            await setDoc(docRef, { list: newList }, { merge: true });
        } catch (e) {
            console.error("Error removing notice:", e);
        }
    };

    return { notices, addNotice, removeNotice, loading };
}
