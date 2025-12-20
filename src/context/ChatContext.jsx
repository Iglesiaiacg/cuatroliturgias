import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
    return useContext(ChatContext);
}

export function ChatProvider({ children }) {
    const { currentUser, userRole } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Subscribe to messages
    useEffect(() => {
        if (!currentUser) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse(); // Reverse to show oldest first at top

            setMessages(msgs);
            setLoading(false);

            // Simple unread logic: if chat is closed, increment
            // In a real app, track lastReadTimestamp per user
            if (!isOpen) {
                // This is a naive implementation, ideally we compare with last view time
                // For now, we won't auto-increment here to avoid infinite loops or complexity
                // We'll rely on a manual "new message" visual cue if needed
            }
        });

        return unsubscribe;
    }, [currentUser, isOpen]);

    const sendMessage = async (text) => {
        if (!currentUser || !text.trim()) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text,
                uid: currentUser.uid,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL,
                role: userRole || 'guest',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnreadCount(0);
    };

    const value = {
        messages,
        sendMessage,
        isOpen,
        toggleChat,
        unreadCount
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}
