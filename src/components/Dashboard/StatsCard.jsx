import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import StatsHistoryModal from './StatsHistoryModal';

export default function StatsCard({ readOnly = false }) {
    // Key calculation
    const getSundayDate = () => {
        const current = new Date();
        if (current.getDay() !== 0) { // Not Sunday
            current.setDate(current.getDate() - current.getDay());
        }
        return current.toDateString();
    };

    // ... (rest of state initialization remains the same)

    const [dateKey] = useState(() => getSundayDate());

    const [stats, setStats] = useState(() => {
        const key = getSundayDate();
        const allStats = JSON.parse(localStorage.getItem('liturgia_stats') || '{}');
        return allStats[key] || {
            men: '',
            women: '',
            children: '',
            communicants: ''
        };
    });

    const [lastWeek] = useState(() => {
        const key = getSundayDate();
        const allStats = JSON.parse(localStorage.getItem('liturgia_stats') || '{}');

        const keys = Object.keys(allStats).sort((a, b) => new Date(b) - new Date(a));
        const prevKey = keys.find(k => k !== key);
        return prevKey ? { date: prevKey, ...allStats[prevKey] } : null;
    });

    const [isEditing, setIsEditing] = useState(false);

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
        <div className="neumorphic-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">equalizer</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Asistencia</span>
                </div>
                {!readOnly && (
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="text-xs font-bold text-primary hover:text-red-700 transition-colors"
                    >
                        {isEditing ? 'GUARDAR' : 'EDITAR'}
                    </button>
                )}
            </div>

            <div className="flex items-end gap-3 mb-8">
                <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white leading-none tracking-tighter">
                    {total}
                </div>
                {lastWeek && (
                    <div className={`flex items-center text-xs font-bold mb-1.5 px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className="material-symbols-outlined text-sm mr-1">{trend >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {Math.abs(trend)}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-3 text-center mb-4">
                <StatInput icon="man" label="H" value={stats.men} onChange={v => setStats({ ...stats, men: v })} isEditing={isEditing} />
                <StatInput icon="woman" label="M" value={stats.women} onChange={v => setStats({ ...stats, women: v })} isEditing={isEditing} />
                <StatInput icon="child_care" label="N" value={stats.children} onChange={v => setStats({ ...stats, children: v })} isEditing={isEditing} />
                <StatInput icon="church" label="Com" value={stats.communicants} onChange={v => setStats({ ...stats, communicants: v })} isEditing={isEditing} highlight />
            </div>

            <div className="mt-auto pt-2 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {format(new Date(dateKey), 'EEEE d MMMM', { locale: es })}
                </p>
            </div>
        </div>
    );
}

function StatInput({ icon, label, value, onChange, isEditing, highlight }) {
    return (
        <div className={`flex flex-col items-center p-2 rounded-lg ${highlight ? 'neumorphic-inset box-shadow-inner' : 'neumorphic-inset'}`}>
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
