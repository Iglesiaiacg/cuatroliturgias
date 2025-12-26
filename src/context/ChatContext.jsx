import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

    // Sound for notifications
    const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    const previousLastMessageIdRef = useRef(null);

    // Subscribe to messages based on current view
    useEffect(() => {
        if (!currentUser) {
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
                        // General View: Show 'general' OR private messages meant for THIS user
                        const isForMe = msg.chatId && msg.chatId.includes(currentUser.uid);
                        const isGeneral = (!msg.chatId && !msg.isPrivate) || msg.chatId === 'general';
                        return isGeneral || isForMe;
                    }
                })
                .reverse();

            setMessages(msgs);
            setLoading(false);

            // Notification Logic (Sound + Badge)
            const lastMsg = msgs[msgs.length - 1];

            // Check if it's a NEW message (diff from last tracked)
            if (lastMsg && lastMsg.id !== previousLastMessageIdRef.current) {
                // Determine if we should notify
                const isIncoming = lastMsg.uid !== currentUser.uid;

                if (isIncoming) {
                    // Play Sound (only if not initial load check - but relying on previousRef changing implies new data)
                    // We check if previousRef was populated to avoid sound on first mount
                    if (previousLastMessageIdRef.current) {
                        notificationSound.play().catch(e => console.log('Audio play blocked:', e));
                    }

                    // Update Badge/Unread count if chat closed
                    if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                        if ('setAppBadge' in navigator) {
                            navigator.setAppBadge(1).catch(e => console.error(e));
                        }
                    }
                }

                // Update ref
                previousLastMessageIdRef.current = lastMsg.id;
            } else if (!lastMsg) {
                previousLastMessageIdRef.current = null;
            }

            // Clear badge if open
            if (isOpen) {
                if ('clearAppBadge' in navigator) {
                    navigator.clearAppBadge().catch(e => console.error(e));
                }
            }
        }, (error) => {
            console.error("Chat sync error:", error);
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
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            setUnreadCount(0);
            if ('clearAppBadge' in navigator) {
                navigator.clearAppBadge().catch(e => console.error(e));
            }
        }
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
