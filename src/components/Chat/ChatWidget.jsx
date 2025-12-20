import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChatWidget() {
    const { messages, sendMessage, isOpen, toggleChat } = useChat();
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage(newMessage);
        setNewMessage('');
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-surface-dark w-[90vw] md:w-96 h-[80vh] md:h-[500px] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 mb-4 flex flex-col overflow-hidden pointer-events-auto animate-fade-in-up">
                    {/* Header */}
                    <div className="p-4 bg-[var(--color-primary)] text-white flex justify-between items-center shadow-md shrink-0">
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">forum</span>
                                Chat de Equipo
                            </h3>
                            <p className="text-xs opacity-90 text-white/80">Coordinación Litúrgica</p>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble_outline</span>
                                <p>No hay mensajes aún.</p>
                                <p className="text-xs">¡Sé el primero en escribir!</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.uid === currentUser.uid;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                            ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                                            : 'bg-white dark:bg-surface-dark dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-bl-none'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {!isMe && (
                                                <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                                                    {msg.displayName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                            {msg.createdAt?.seconds
                                                ? format(new Date(msg.createdAt.seconds * 1000), 'p', { locale: es })
                                                : 'Enviando...'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-100 dark:bg-white/5 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95 pointer-events-auto ${isOpen ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100'}`}
            >
                <span className="material-symbols-outlined text-2xl">chat</span>
            </button>
        </div>
    );
}
