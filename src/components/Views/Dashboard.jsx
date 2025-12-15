export default function Dashboard({ onNavigate, date, feastName }) {
    return (
        <main className="flex-1 flex flex-col px-4 pt-6 pb-24 space-y-8 overflow-y-auto w-full max-w-md mx-auto animate-fade-in">
            {/* Liturgical Hero Card */}
            <section onClick={() => onNavigate('generator')}>
                <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-lg group cursor-pointer border border-gray-100 dark:border-white/5">
                    {/* Image Background */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1548625361-ec8f1cc04c8d?q=80&w=2566&auto=format&fit=crop")' }}
                    >
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent opacity-90"></div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-white">
                        <h2 className="text-3xl font-bold leading-tight mb-2 font-display">{feastName || "Feria del Tiempo Ordinario"}</h2>
                        <p className="text-white/80 text-lg font-normal italic leading-snug max-w-[90%] font-display">
                            "Estad preparados, porque no sabéis a qué hora vendrá el Hijo del hombre."
                        </p>
                        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-primary transition-colors">
                            <span>Ver detalles del día</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Access Grid */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Accesos Rápidos</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {/* Card 1: Lecturas - Triggers Generator */}
                    <button onClick={() => onNavigate('generator')} className="relative flex flex-col p-4 h-32 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all hover:border-primary/50 group text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-auto group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-white font-display">Lecturas</span>
                            <span className="text-xs text-gray-500 dark:text-white/50">Evangelio y Salmos</span>
                        </div>
                    </button>

                    {/* Card 2: Liturgia Horas */}
                    <button className="relative flex flex-col p-4 h-32 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all hover:border-primary/50 group text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-auto group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-white font-display">Liturgia Horas</span>
                            <span className="text-xs text-gray-500 dark:text-white/50">Laudes y Vísperas</span>
                        </div>
                    </button>

                    {/* Card 3: Santoral */}
                    <button className="relative flex flex-col p-4 h-32 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all hover:border-primary/50 group text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-auto group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined">diversity_3</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-white font-display">Santoral</span>
                            <span className="text-xs text-gray-500 dark:text-white/50">Vida de Santos</span>
                        </div>
                    </button>

                    {/* Card 4: Oraciones */}
                    <button className="relative flex flex-col p-4 h-32 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all hover:border-primary/50 group text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-auto group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined">volunteer_activism</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-white font-display">Oraciones</span>
                            <span className="text-xs text-gray-500 dark:text-white/50">Comunes y Propias</span>
                        </div>
                    </button>
                </div>
            </section>
        </main>
    );
}
