import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import logoHome from '../../assets/logo.png';

export default function TopBar({ date, onSettings }) {
    const dateStr = format(date, "EEEE, d MMM", { locale: es });

    return (
        <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 pt-12 pb-4 flex items-center justify-between transition-colors duration-300">
            <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-widest text-primary mb-0.5 capitalize">{dateStr}</span>
                <div className="flex items-center gap-3">
                    <img src={logoHome} alt="Liturgia Logo" className="h-8 w-auto object-contain" />
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display">LITÚRG-IA /CG</h1>
                </div>
            </div>
            <button
                onClick={onSettings}
                aria-label="Configuración"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-outlined text-gray-900 dark:text-white" style={{ fontSize: '24px' }}>settings</span>
            </button>
        </header>
    );
}
