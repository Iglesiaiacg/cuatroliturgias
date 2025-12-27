import { useState } from 'react';
import Preview from '../Liturgy/Preview';
import NoticesCard from './NoticesCard';
import NextLiturgyCard from './NextLiturgyCard';
import { useChat } from '../../context/ChatContext';

export default function GuestDashboard({ onNavigate, pinnedLiturgy, date }) {
    const [isReadingPinned, setIsReadingPinned] = useState(false);
    const { toggleChat } = useChat();

    return (
        <main className="flex-1 flex flex-col px-4 pt-6 space-y-8 overflow-y-auto w-full max-w-4xl mx-auto animate-fade-in">

            {/* Greeting Header */}
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                    Bienvenido a Casa
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Comunidad de Gracia - {date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(date) : ''}
                </p>
            </div>

            {/* PINNED LITURGY SECTION (Devotional Focus) */}
            {pinnedLiturgy && !isReadingPinned && (
                <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden text-center">
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-red-200">church</span>
                            <span className="text-red-100 font-bold tracking-widest uppercase text-xs">Misa en Curso</span>
                        </div>

                        <h2 className="text-4xl font-display font-bold mb-1">{pinnedLiturgy.title || "Santa Eucaristía"}</h2>
                        <p className="text-red-100 text-lg opacity-90 max-w-lg mx-auto">
                            Únete a la celebración desde tu dispositivo. Sigue las lecturas y cantos en tiempo real.
                        </p>

                        <button
                            onClick={() => setIsReadingPinned(true)}
                            className="mt-4 px-8 py-4 bg-white text-red-900 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">menu_book</span>
                            SEGUIR LITURGIA AHORA
                        </button>
                    </div>
                </div>
            )}

            {/* READER MODE */}
            {isReadingPinned && pinnedLiturgy && (
                <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-slide-in">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Modo Fiel</span>
                            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{pinnedLiturgy.title}</span>
                        </div>
                        <button
                            onClick={() => setIsReadingPinned(false)}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full font-serif text-lg leading-relaxed">
                        <Preview content={pinnedLiturgy.content} rubricLevel={'simple'} />
                    </div>
                </div>
            )}


            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Notices */}
                <NoticesCard />

                {/* Upcoming */}
                {!pinnedLiturgy && (
                    <NextLiturgyCard />
                )}

                {/* Donation / Offering Call to Action */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800/30 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ofrenda Digital</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apoya a nuestra comunidad. Tu generosidad hace posible nuestra misión.</p>
                    </div>
                    <button
                        onClick={() => alert("Próximamente: Donaciones en línea")}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
                    >
                        Dar Ofrenda
                    </button>
                </div>

                {/* Contact Priority */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800/30 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-3xl">chat</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">¿Necesitas ayuda?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Estamos aquí para ti. Escribe al equipo pastoral.</p>
                    </div>
                    {/* Logic to open chat handled by ChatContext */}
                    <button
                        onClick={toggleChat}
                        className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors w-full md:w-auto"
                    >
                        Abrir Chat
                    </button>
                </div>

            </div>
        </main>
    );
}
