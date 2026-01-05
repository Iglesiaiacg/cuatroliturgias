import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, 'users', currentUser.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read).length);
        }, (error) => {
            console.error("Notifications Sync Error:", error);
            // Gracefully handle permission denied
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (id) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', id), {
                read: true
            });
        } catch (e) {
            console.error("Error marking notification as read:", e);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        try {
            const batch = writeBatch(db);
            unread.forEach(n => {
                const docRef = doc(db, 'users', currentUser.uid, 'notifications', n.id);
                batch.update(docRef, { read: true });
            });
            await batch.commit();
        } catch (e) {
            console.error("Error batch marking notifications:", e);
        }
    };

    // Helper to send notification to ANY user (admin usage)
    const sendNotification = async (userId, title, message, type = 'info') => {
        try {
            await addDoc(collection(db, 'users', userId, 'notifications'), {
                title,
                message,
                type, // 'info', 'success', 'warning', 'error'
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Error sending notification:", e);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, sendNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}
