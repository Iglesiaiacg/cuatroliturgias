import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { marked } from 'marked';

export default function ChatWidget({ context }) {
    const {
        messages, sendMessage, isOpen, toggleChat, activeChat, setActiveChat, startPrivateChat,
        isAiMode, toggleAiMode, aiMessages, sendAiMessage
    } = useChat();
    const { currentUser, userRole } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, aiMessages, isOpen, isAiMode]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (isAiMode) {
            sendAiMessage(newMessage, context);
        } else {
            sendMessage(newMessage);
        }
        setNewMessage('');
    };

    if (!currentUser) return null;

    // Determine which messages to show
    const displayMessages = isAiMode ? aiMessages : messages;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
                        onClick={toggleChat}
                        style={{ pointerEvents: 'auto' }}
                    />

                    <div className="bg-white dark:bg-surface-dark w-[90vw] md:w-96 h-[80vh] md:h-[500px] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 mb-4 flex flex-col overflow-hidden pointer-events-auto animate-fade-in-up z-50 relative transition-all duration-300">
                        {/* Header */}
                        <div className={`p-4 flex justify-between items-center shadow-md shrink-0 transition-colors ${isAiMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                            activeChat ? 'bg-purple-600' : 'bg-[var(--color-primary)]'
                            }`}>
                            <div className="flex items-center gap-3 text-white">
                                {activeChat && !isAiMode && (
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="p-1 -ml-2 hover:bg-white/20 rounded-full transition-colors"
                                        title="Volver al Chat General"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                )}
                                <div>
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">
                                            {isAiMode ? 'smart_toy' : (activeChat ? 'lock' : 'forum')}
                                        </span>
                                        {isAiMode ? 'Asistente IA' : (activeChat ? activeChat.fullName || activeChat.displayName : 'Chat de Equipo')}
                                    </h3>
                                    <p className="text-xs opacity-90 text-white/80">
                                        {isAiMode ? 'Ayuda contextual' : (activeChat ? 'Mensaje Directo' : 'Coordinación Litúrgica')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* AI Toggle */}
                                <button
                                    onClick={toggleAiMode}
                                    className={`p-2 rounded-full transition-colors text-white ${isAiMode ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                    title={isAiMode ? "Volver a Chat Humano" : "Activar Asistente IA"}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {isAiMode ? 'chat' : 'smart_toy'}
                                    </span>
                                </button>

                                <button
                                    onClick={toggleChat}
                                    className="p-2 -mr-2 hover:bg-white/20 rounded-full transition-colors text-white"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                            {displayMessages.length === 0 && (
                                <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                                        {isAiMode ? 'auto_awesome' : (activeChat ? 'lock_open' : 'chat_bubble_outline')}
                                    </span>
                                    <p>{isAiMode ? '¡Hola! Soy tu asistente litúrgico.' : (activeChat ? 'Inicio del chat privado' : 'No hay mensajes aún.')}</p>
                                    <p className="text-xs">{isAiMode ? 'Pregúntame sobre la misa de hoy.' : (activeChat ? 'Solo visible para ambos.' : '¡Sé el primero en escribir!')}</p>
                                </div>
                            )}

                            {displayMessages.map((msg) => {
                                // Logic for Human Chat vs AI Chat
                                let isMe = false;
                                let isPrivateMsg = false;
                                let displayName = '';

                                if (isAiMode) {
                                    isMe = msg.role === 'user';
                                    displayName = isMe ? 'Tú' : 'IA';
                                } else {
                                    isMe = msg.uid === currentUser.uid;
                                    isPrivateMsg = msg.isPrivate || (msg.chatId && msg.chatId !== 'general');
                                    displayName = msg.displayName;
                                }

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
                                        <div
                                            onClick={() => !isAiMode && !activeChat && isPrivateMsg && !isMe ? startPrivateChat({ id: msg.uid, fullName: msg.displayName }) : null}
                                            className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm relative group cursor-pointer ${isMe
                                                ? (isAiMode ? 'bg-indigo-600 text-white rounded-br-none' : (activeChat || isPrivateMsg ? 'bg-purple-600 text-white rounded-br-none' : 'bg-[var(--color-primary)] text-white rounded-br-none'))
                                                : (isAiMode
                                                    ? 'bg-white dark:bg-surface-dark dark:text-gray-200 border border-indigo-100 dark:border-indigo-500/30 rounded-bl-none text-gray-800'
                                                    : (isPrivateMsg
                                                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-bl-none'
                                                        : 'bg-white dark:bg-surface-dark dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-bl-none'))
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {!isMe && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isAiMode ? 'text-indigo-500' : (isPrivateMsg ? 'text-purple-600 dark:text-purple-300' : 'opacity-70')}`}>
                                                        {displayName} {isPrivateMsg && !isAiMode && '🔒 PRIVADO'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* ACTION CARD RENDERER */}
                                            {msg.isAction ? (
                                                <ActionCard
                                                    message={msg}
                                                    userRole={userRole || 'guest'} // Pass effective role
                                                />
                                            ) : (
                                                /* REGULAR TEXT CONTENT */
                                                isAiMode && !isMe ? (
                                                    <div
                                                        className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4"
                                                        dangerouslySetInnerHTML={{ __html: msg.loading ? '<span class="animate-pulse">Pensando...</span>' : marked.parse(msg.text || '') }}
                                                    />
                                                ) : (
                                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!isMe && isPrivateMsg ? 'text-purple-900 dark:text-purple-100' : ''}`}>
                                                        {msg.text}
                                                    </p>
                                                )
                                            )}

                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : (isPrivateMsg || isAiMode ? 'text-indigo-400' : 'text-gray-400')}`}>
                                                {msg.createdAt?.seconds
                                                    ? format(new Date(msg.createdAt.seconds * 1000), 'p', { locale: es })
                                                    : (msg.createdAt instanceof Date ? format(msg.createdAt, 'p', { locale: es }) : '')}
                                            </div>

                                            {!activeChat && isPrivateMsg && !isMe && !isAiMode && (
                                                <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                                                    Clic para responder
                                                </div>
                                            )}
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
                                    placeholder={isAiMode ? "Pregunta a la IA..." : (activeChat ? "Mensaje privado..." : "Escribe un mensaje...")}
                                    className={`flex-1 bg-gray-100 dark:bg-white/5 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 dark:text-white ${isAiMode ? 'focus:ring-indigo-500' : 'focus:ring-[var(--color-primary)]'}`}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className={`w-10 h-10 ${isAiMode ? 'bg-indigo-600' : (activeChat ? 'bg-purple-600' : 'bg-[var(--color-primary)]')} text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${isAiMode ? 'bg-indigo-600' : 'bg-[var(--color-primary)]'} text-white hover:scale-105 active:scale-95 pointer-events-auto ${isOpen ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100'} !text-white`}
            >
                <span className="material-symbols-outlined text-2xl !text-white">
                    {isAiMode ? 'smart_toy' : 'chat'}
                </span>
                {!isOpen && messages.length > 0 && messages[messages.length - 1]?.uid !== currentUser?.uid && !isAiMode && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse shadow-sm"></span>
                )}
            </button>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function ActionCard({ message, userRole }) {
    const { executePendingAction } = useChat();
    const [status, setStatus] = useState('pending'); // pending, executing, done, error
    const [validationError, setValidationError] = useState(null);

    // Dynamic import to avoid circular dep issues in rendering if necessary,
    // but here we just need the validator function. 
    // We'll rely on a simple permission check or assume the service is available.
    // Ideally we import { validateAiAction } from '../../services/AiActionService';
    // but since we are inside a component, let's just do the check.

    useEffect(() => {
        // Validate Permission on Mount
        const check = async () => {
            const { validateAiAction } = await import('../../services/AiActionService');
            const allowed = validateAiAction(userRole, message.content.target);
            if (!allowed) {
                setValidationError("No tienes permiso para modificar esto.");
            }
        };
        check();
    }, [userRole, message]);

    const handleConfirm = () => {
        setStatus('executing');
        executePendingAction(message.content)
            .then(() => setStatus('done'))
            .catch(() => setStatus('error'));
    };

    const action = message.content;
    const isDestructive = action.action === 'DELETE';

    return (
        <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-3 border border-gray-200 dark:border-white/10 mt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${isDestructive ? 'text-red-600' : 'text-indigo-600'}`}>
                    {isDestructive ? 'warning' : 'edit_square'}
                </span>
                {action.action} : {action.target}
            </h4>

            <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 italic">
                "{action.message}"
            </p>

            {/* DETAILS PREVIEW (Simplified) */}
            {action.data && (
                <div className="text-xs font-mono bg-white dark:bg-black/40 p-2 rounded mb-3 overflow-x-auto text-gray-600 dark:text-gray-400">
                    {JSON.stringify(action.data).substring(0, 100)}{JSON.stringify(action.data).length > 100 && '...'}
                </div>
            )}

            {validationError ? (
                <div className="text-xs text-red-500 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    PERMISO DENEGADO
                </div>
            ) : status === 'done' ? (
                <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    REALIZADO
                </div>
            ) : status === 'executing' ? (
                <div className="text-xs text-indigo-500 animate-pulse">Procesando...</div>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={handleConfirm}
                        className={`px-3 py-1.5 rounded text-xs font-bold text-white shadow-sm active:scale-95 transition-all ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        CONFIRMAR
                    </button>
                    {/* Only show Cancel if not forced by system to persist? Actually just ignoring it is "Cancel" */}
                    <div className="text-[10px] text-gray-400 self-center">
                        Requiere aprobación
                    </div>
                </div>
            )}
        </div>
    );
}
