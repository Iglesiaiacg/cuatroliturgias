import { identifyFeast, getLiturgicalColor, getLiturgicalCycle } from '../../services/liturgy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NextLiturgyCard({ onClick }) {
    // Calculate Next Sunday (Derived State)
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);

    // If today is NOT Sunday, move to next Sunday.
    // If today IS Sunday, we keep it as nextSunday (same day) to show today's liturgy.
    if (today.getDay() !== 0) {
        nextSunday.setDate(today.getDate() + (7 - today.getDay()));
    }

    const feast = identifyFeast(nextSunday);
    const color = getLiturgicalColor(nextSunday);
    const cycle = getLiturgicalCycle(nextSunday);

    const info = {
        date: nextSunday,
        feast,
        color,
        cycle
    };

    if (!info) return null;

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group
                ${info.color.classes}
            `}
        >
            {/* Background Pattern/Icon based on color? Optional */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">church</span>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Próxima Liturgia
                        </span>
                    </div>

                    <h3 className="text-2xl font-display font-bold leading-tight mb-1">
                        {info.feast}
                    </h3>

                    <div className="flex items-center gap-2 text-sm opacity-90 font-medium">
                        <span>{format(info.date, "EEEE d 'de' MMMM", { locale: es })}</span>
                        <span>•</span>
                        <span>{info.color.name}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest opacity-70">Ciclo</span>
                        <span className="font-bold text-sm">{info.cycle.text}</span>
                    </div>

                    <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
