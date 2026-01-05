import { useState, useRef, useEffect } from 'react';
import { useNoticesSync } from '../../hooks/useNoticesSync';
import { useChat } from '../../context/ChatContext';
import { useDirectory } from '../../context/DirectoryContext';
import { useAuth } from '../../context/AuthContext';

export default function CommunicationCenter({ onClose }) {
    const [activeTab, setActiveTab] = useState('broadcast'); // broadcast, private, general
    const { notices, addNotice, removeNotice } = useNoticesSync();
    const { messages, sendMessage, startPrivateChat, activeChat, setActiveChat } = useChat();
    const { members } = useDirectory();
    const { currentUser } = useAuth();

    // Broadcast State
    const [noticeText, setNoticeText] = useState('');

    // Chat State
    const [chatText, setChatText] = useState('');
    const chatEndRef = useRef(null);

    // Private Chat Selection
    const [selectedUser, setSelectedUser] = useState(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab, selectedUser]);

    const handlePostNotice = (e) => {
        e.preventDefault();
        if (!noticeText.trim()) return;
        addNotice(noticeText);
        setNoticeText('');
    };

    const handleSendChat = (e) => {
        e.preventDefault();
        if (!chatText.trim()) return;
        sendMessage(chatText);
        setChatText('');
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        startPrivateChat(user); // Sets context activeChat
        setActiveTab('private_conversation');
    };

    const handleBackToUsers = () => {
        setSelectedUser(null);
        setActiveChat(null);
        setActiveTab('private');
    };

    // Filter out current user from directory
    const contactList = members.filter(m => m.id !== currentUser?.uid);

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark shadow-sm px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Centro de Comunicaciones</h2>
                    <p className="text-xs text-gray-500">Gestión centralizada de mensajes y avisos</p>
                </div>
                <button onClick={onClose} className="neumorphic-btn w-10 h-10 flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 px-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold transition-colors whitespace-nowrap ${activeTab === 'broadcast' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="material-symbols-outlined">campaign</span>
                    Difusión
                </button>
                <button
                    onClick={() => setActiveTab('private')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold transition-colors whitespace-nowrap ${activeTab.startsWith('private') ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="material-symbols-outlined">forum</span>
                    Mensajería Privada
                </button>
                <button
                    onClick={() => { setActiveTab('general'); setActiveChat(null); }}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="material-symbols-outlined">groups</span>
                    Chat General
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 max-w-5xl mx-auto w-full">

                {/* 1. BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                    <div className="h-full flex flex-col gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-4 items-start">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">info</span>
                            <div>
                                <h3 className="font-bold text-blue-900 dark:text-blue-100">Sobre la Difusión</h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Los mensajes publicados aquí aparecerán en la pantalla de inicio de <strong>todos</strong> los usuarios (Feligreses y Servidores).
                                    Es un canal unidireccional; ellos no pueden responder aquí.
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 md:pb-0">
                            {/* Write Broadcast */}
                            <form onSubmit={handlePostNotice} className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm flex flex-col h-auto md:h-full shrink-0">
                                <label className="font-bold text-gray-700 dark:text-gray-300 mb-2">Escribir Nuevo Aviso</label>
                                <textarea
                                    value={noticeText}
                                    onChange={(e) => setNoticeText(e.target.value)}
                                    placeholder="Ej: El próximo domingo la misa iniciará a las 10:30 AM..."
                                    className="flex-1 w-full p-4 bg-gray-50 dark:bg-black/20 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 mb-4 min-h-[150px]"
                                />
                                <button disabled={!noticeText.trim()} className="btn-primary py-3 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">send</span>
                                    Publicar Aviso
                                </button>
                            </form>

                            {/* Active Notices List */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm flex flex-col h-full overflow-hidden min-h-[200px]">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Avisos Activos</h4>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {notices.length === 0 ? (
                                        <div className="text-center text-gray-400 py-10">No hay avisos publicados.</div>
                                    ) : (
                                        notices.map(n => (
                                            <div key={n.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-lg flex justify-between items-start group">
                                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{n.text}</p>
                                                <button onClick={() => removeNotice(n.id)} className="text-gray-400 hover:text-red-500 transition-all">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PRIVATE CHAT LIST TAB */}
                {activeTab === 'private' && (
                    <div className="h-full bg-white dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-gray-800 dark:text-white">Seleccionar Usuario</h3>
                            <p className="text-xs text-gray-500">Elige un usuario para iniciar o continuar un chat privado.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contactList.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                        {user.displayName ? user.displayName[0].toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{user.displayName || 'Sin Nombre'}</h4>
                                        <p className="text-xs text-gray-500 truncate">{user.role}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">chat_bubble</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. CHAT INTERFACE (Shared for General & Private) */}
                {(activeTab === 'general' || activeTab === 'private_conversation') && (
                    <div className="h-full bg-white dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 bg-gray-50 dark:bg-black/20">
                            {activeTab === 'private_conversation' && (
                                <button onClick={handleBackToUsers} className="mr-2 text-gray-500 hover:text-gray-900">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                            )}
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">
                                    {activeTab === 'general' ? 'groups' : 'person'}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    {activeTab === 'general' ? 'Chat General (Público)' : selectedUser?.displayName}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {activeTab === 'general' ? 'Comunidad (Todos pueden leer)' : activeChat?.role || 'Privado'}
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/10">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                                    <p>No hay mensajes aún.</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.uid === currentUser?.uid;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/5'
                                                }`}>
                                                {!isMe && <p className="text-[10px] font-bold opacity-70 mb-1">{msg.displayName}</p>}
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendChat} className="p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-100 dark:bg-black/20 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!chatText.trim()}
                                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
