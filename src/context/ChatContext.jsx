import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    where
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
    const [activeChat, setActiveChat] = useState(null); // null = General, object = Private User

    // Helper to get consistent Chat ID
    const getChatId = (uid1, uid2) => {
        if (!uid1 || !uid2) return 'general';
        return [uid1, uid2].sort().join('_');
    };

    const currentChatId = activeChat
        ? getChatId(currentUser?.uid, activeChat.id)
        : 'general';

    // Subscribe to messages based on current view
    useEffect(() => {
        if (!currentUser || userRole === 'guest') {
            setMessages([]);
            return;
        }

        let q;

        if (activeChat) {
            // Private Chat Query
            q = query(
                collection(db, 'messages'),
                where('chatId', '==', currentChatId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
        } else {
            // General Chat Query
            // We use client-side filtering below for legacy 'general' messages
            q = query(
                collection(db, 'messages'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(msg => {
                    if (activeChat) {
                        return msg.chatId === currentChatId;
                    } else {
                        // General View: Show only 'general' or undefined (legacy)
                        // AND ENSURE we don't show private messages meant for others
                        // A message is general if:
                        // 1. It has chatId === 'general'
                        // 2. OR it has NO chatId (legacy) AND NO isPrivate flag
                        return (!msg.chatId && !msg.isPrivate) || msg.chatId === 'general';
                    }
                })
                .reverse();

            setMessages(msgs);
            setLoading(false);

            if (!isOpen) {
                // Unread logic placeholder
            }
        });

        return unsubscribe;
    }, [currentUser, isOpen, userRole, activeChat, currentChatId]);

    const sendMessage = async (text) => {
        if (!currentUser || !text.trim()) return;

        try {
            const messageData = {
                text,
                uid: currentUser.uid,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL,
                role: userRole || 'guest',
                createdAt: serverTimestamp(),
                chatId: currentChatId
            };

            if (activeChat) {
                messageData.recipientId = activeChat.id;
                messageData.isPrivate = true;
            } else {
                messageData.chatId = 'general';
            }

            await addDoc(collection(db, 'messages'), messageData);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnreadCount(0);
    };

    const startPrivateChat = (targetUser) => {
        setActiveChat(targetUser);
        setIsOpen(true);
    };

    const value = {
        messages,
        sendMessage,
        isOpen,
        toggleChat,
        unreadCount,
        activeChat,
        setActiveChat,
        startPrivateChat
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}
