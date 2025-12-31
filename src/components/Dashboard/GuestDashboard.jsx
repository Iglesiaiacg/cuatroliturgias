import { useState } from 'react';
import Preview from '../Liturgy/Preview';
import NoticesCard from './NoticesCard';
import NextLiturgyCard from './NextLiturgyCard';
import IntentionsCard from './IntentionsCard';
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
                (() => {
                    const now = new Date();
                    const isSunday = now.getDay() === 0;
                    const hour = now.getHours();
                    const isLive = isSunday && hour >= 8 && hour < 14;

                    return (
                        <div className={`rounded-2xl p-8 shadow-xl relative overflow-hidden text-center transition-all duration-500
                            ${isLive
                                ? 'bg-gradient-to-br from-red-900 to-red-700 text-white'
                                : 'bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
                            }`}>

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`material-symbols-outlined ${isLive ? 'text-red-200' : 'text-primary'}`}>church</span>
                                    <span className={`${isLive ? 'text-red-100' : 'text-gray-500'} font-bold tracking-widest uppercase text-xs`}>
                                        {isLive ? 'Misa en Curso' : 'Próxima Celebración'}
                                    </span>
                                </div>

                                <h2 className="text-4xl font-display font-bold mb-1 capitalize">
                                    {(() => {
                                        if (!pinnedLiturgy.date) return pinnedLiturgy.title || "Santa Eucaristía";
                                        const lDate = new Date(pinnedLiturgy.date.seconds * 1000);
                                        if (lDate.getDay() === 0) {
                                            const options = { weekday: 'long', day: 'numeric', month: 'long' };
                                            return lDate.toLocaleDateString('es-MX', options);
                                        }
                                        return pinnedLiturgy.title;
                                    })()}
                                </h2>
                                <p className={`${isLive ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'} text-lg opacity-90 max-w-lg mx-auto`}>
                                    {pinnedLiturgy.date && new Date(pinnedLiturgy.date.seconds * 1000).getDay() === 0
                                        ? (pinnedLiturgy.title || "Santa Misa")
                                        : (isLive
                                            ? "Únete a la celebración desde tu dispositivo."
                                            : "Prepárate para la Santa Misa.")}
                                </p>

                                {/* Buttons only visible on Weekend (Sat/Sun) */}
                                {(isSunday || (now.getDay() === 6)) && (
                                    <button
                                        onClick={() => setIsReadingPinned(true)}
                                        className={`mt-4 px-8 py-4 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2
                                            ${isLive
                                                ? 'bg-white text-red-900 hover:bg-gray-100'
                                                : 'bg-primary text-white hover:bg-red-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">menu_book</span>
                                        {isLive ? 'SEGUIR LITURGIA AHORA' : 'VER GUION Y LECTURAS'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })()
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
                <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-6 border border-stone-100 dark:border-stone-800/30 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-800 dark:text-red-400 shadow-sm">
                        <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ofrenda Digital</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apoya a nuestra comunidad. Tu generosidad hace posible nuestra misión.</p>
                    </div>
                    <button
                        onClick={() => onNavigate('offerings')}
                        className="px-6 py-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-lg transition-all w-full md:w-auto shadow-md active:scale-95"
                    >
                        Ofrenda de amor
                    </button>
                </div>

                {/* Contact Priority */}
                <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-6 border border-stone-100 dark:border-stone-800/30 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-800 dark:text-red-400 shadow-sm">
                        <span className="material-symbols-outlined text-3xl">chat</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">¿Necesitas ayuda?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Estamos aquí para ti. Escribe al equipo pastoral.</p>
                    </div>
                    {/* Logic to open chat handled by ChatContext */}
                    <button
                        onClick={toggleChat}
                        className="px-6 py-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-lg transition-all w-full md:w-auto shadow-md active:scale-95"
                    >
                        Abrir Chat
                    </button>
                </div>

                {/* Intentions Module (Full Width on Mobile) */}
                <div className="md:col-span-2">
                    <div className="h-full min-h-[300px]">
                        <import('../Dashboard/IntentionsCard').default />
                        {/* Wait, dynamic import in JSX is not ideal. Need to import at top. 
                           I will just add the component Assuming it's imported.
                           Correction: I will use ReplaceFileContent properly in next step to add import.
                           For this step, I will just place the component.
                        */}
                        <div className="h-full">
                            <IntentionsCard />
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
