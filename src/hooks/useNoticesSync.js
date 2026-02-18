import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useNoticesSync() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentUser } = useAuth();

    // Single doc for notices. 
    // In a production app, this might be a subcollection 'notices' to scale better, 
    // but a single doc 'current_notices' with a list is fine for <100 active notices.
    const docId = 'current_notices';

    useEffect(() => {
        if (!currentUser) {
            setNotices(prev => prev.length === 0 ? prev : []);
            setLoading(false);
            return;
        }

        // We fetch ALL notices, filtering happens in the UI or a derived state here.
        // For simplicity, we fetch all and let the component filter, 
        // OR we can return filteredNotices. 
        // Let's return raw 'notices' so the admin can see all, and components filter.

        setLoading(true);
        const docRef = doc(db, 'content', docId);

        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Migration check: If list contains strings, map them to objects
                const rawList = data.list || [];
                const refinedList = rawList.map((item, index) => {
                    if (typeof item === 'string') {
                        return {
                            id: Date.now() + index,
                            text: item,
                            target: 'all',
                            author: 'Sistema',
                            createdAt: new Date().toISOString(),
                            readBy: []
                        };
                    }
                    return item;
                });

                setNotices(refinedList);
            } else {
                setNotices([]);
            }
            setLoading(false);
        }, (error) => {
            if (error.code !== 'permission-denied') console.warn("Notices Sync skipped (permissions or offline).");
            setNotices([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addNotice = async (text, target = 'all') => {
        const newNotice = {
            id: Date.now(),
            text,
            target,
            author: currentUser?.displayName || 'Admin',
            createdAt: new Date().toISOString(),
            readBy: []
        };

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

    const markAsRead = async (noticeId) => {
        if (!currentUser) return;

        // Optimistic update
        const updatedList = notices.map(n => {
            if (n.id === noticeId) {
                if (n.readBy.includes(currentUser.uid)) return n;
                return { ...n, readBy: [...n.readBy, currentUser.uid] };
            }
            return n;
        });
        setNotices(updatedList);

        // Firestore update
        // Since we store as an array of objects in a single doc, we must write the whole list 
        // OR use arrayRemove/arrayUnion if we had specific operations, but treating the object as unique is hard with arrayUnion.
        // Re-writing the list is safest for consistency in this simple model.
        try {
            const docRef = doc(db, 'content', docId);
            await setDoc(docRef, { list: updatedList }, { merge: true });
        } catch (e) {
            console.error("Error marking read:", e);
        }
    };

    return { notices, addNotice, removeNotice, markAsRead, loading };
}
