import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StatsCard() {
    const [stats, setStats] = useState({
        men: '',
        women: '',
        children: '',
        communicants: ''
    });
    const [lastWeek, setLastWeek] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Key includes the date of the nearest Sunday? 
    // For simplicity, let's just store "Latest Entry" and "Previous Entry" logic 
    // or just store by specific date key.
    // Let's default to "This Sunday" (or nearest past Sunday if today is Monday-Sat)

    const getSundayDate = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Next Sunday if Mon-Sat? 
        // Usually stats are entered FOR the service. If it's Sunday, today. If Monday, yesterday.
        // Let's just use "Last Sunday" logic if today is not Sunday.
        const current = new Date();
        if (current.getDay() !== 0) { // Not Sunday
            current.setDate(current.getDate() - current.getDay());
        }
        return current.toDateString();
    };

    const dateKey = getSundayDate();

    useEffect(() => {
        try {
            const allStats = JSON.parse(localStorage.getItem('liturgia_stats') || '{}');
            if (allStats[dateKey]) {
                setStats(allStats[dateKey]);
            }

            // Find previous entry
            const keys = Object.keys(allStats).sort((a, b) => new Date(b) - new Date(a));
            const prevKey = keys.find(k => k !== dateKey);
            if (prevKey) {
                setLastWeek({ date: prevKey, ...allStats[prevKey] });
            }

        } catch (e) {
            console.error(e);
        }
    }, [dateKey]);

    const handleSave = () => {
        const allStats = JSON.parse(localStorage.getItem('liturgia_stats') || '{}');
        allStats[dateKey] = stats;
        localStorage.setItem('liturgia_stats', JSON.stringify(allStats));
        setIsEditing(false);
    };

    const total = (parseInt(stats.men || 0) + parseInt(stats.women || 0) + parseInt(stats.children || 0));
    const lastTotal = lastWeek ? (parseInt(lastWeek.men || 0) + parseInt(lastWeek.women || 0) + parseInt(lastWeek.children || 0)) : 0;

    // Trend
    const trend = total - lastTotal;

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">equalizer</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Asistencia</span>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="text-xs font-bold text-primary hover:text-red-700 transition-colors"
                >
                    {isEditing ? 'GUARDAR' : 'EDITAR'}
                </button>
            </div>

            <div className="flex items-end gap-3 mb-6">
                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white leading-none">
                    {total}
                </div>
                {lastWeek && (
                    <div className={`flex items-center text-xs font-bold mb-1 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-sm">{trend >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {Math.abs(trend)} vs semana ant.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
                <StatInput icon="man" label="H" value={stats.men} onChange={v => setStats({ ...stats, men: v })} isEditing={isEditing} />
                <StatInput icon="woman" label="M" value={stats.women} onChange={v => setStats({ ...stats, women: v })} isEditing={isEditing} />
                <StatInput icon="child_care" label="N" value={stats.children} onChange={v => setStats({ ...stats, children: v })} isEditing={isEditing} />
                <StatInput icon="church" label="Com" value={stats.communicants} onChange={v => setStats({ ...stats, communicants: v })} isEditing={isEditing} highlight />
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Domingo {format(new Date(dateKey), 'dd MMM', { locale: es })}
                </p>
            </div>
        </div>
    );
}

function StatInput({ icon, label, value, onChange, isEditing, highlight }) {
    return (
        <div className={`flex flex-col items-center p-2 rounded-lg ${highlight ? 'bg-primary/5 dark:bg-white/5 border border-primary/10' : 'bg-gray-50 dark:bg-black/20'}`}>
            <span className="material-symbols-outlined text-sm text-gray-400 mb-1">{icon}</span>
            {isEditing ? (
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full text-center bg-transparent border-b border-primary/50 text-sm font-bold outline-none p-0"
                />
            ) : (
                <span className={`text-sm font-bold ${highlight ? 'text-primary dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
                    {value || '-'}
                </span>
            )}
            <span className="text-[9px] uppercase font-bold text-gray-400 mt-1">{label}</span>
        </div>
    );
}
