import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getLiturgicalColor, getLiturgicalCycle, identifyFeast } from '../../services/liturgy';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';

export default function DayDetailsModal({ date, onClose, onGenerate }) {

    const { getEventsForDate, addEvent, deleteEvent, updateRoster, getRoster, updateDailyReminder, getDailyReminder } = useCalendarEvents();

    const [activeTab, setActiveTab] = useState('liturgia'); // 'liturgia' | 'parroquia'

    // Derived State
    const events = getEventsForDate(date);
    const dailyReminderText = getDailyReminder(date);
    const color = getLiturgicalColor(date);
    const feastName = identifyFeast(date);
    const cycle = getLiturgicalCycle(date);
    const isSunday = date.getDay() === 0;

    // Form State
    const [newEvent, setNewEvent] = useState({ title: '', type: 'pastoral' });
    const [rosterForm, setRosterForm] = useState(() => getRoster(date));
    const [reminderForm, setReminderForm] = useState(dailyReminderText);
    // Date Format
    const dateStr = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Handlers
    const handleAddEvent = () => {
        if (!newEvent.title) return;
        addEvent({
            ...newEvent,
            date: date,
        });
        setNewEvent({ title: '', type: 'pastoral' });
    };

    const handleRosterChange = (role, value) => {
        const newRoster = { ...rosterForm, [role]: value };
        setRosterForm(newRoster);
        updateRoster(date, newRoster);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 transform transition-all animate-scale-in flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Color */}
                <div className={`h-24 shrink-0 ${color.classes.replace('text-', 'bg-').split(' ')[0].replace('100', '500').replace('/50', '')} relative`}>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors z-10">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                    <div className="absolute -bottom-6 left-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white dark:bg-gray-800`}>
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-8 px-6 pb-6 flex-1 overflow-y-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{formattedDate}</span>
                    <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-1 mb-4 leading-tight">
                        {feastName}
                    </h2>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-gray-100 dark:border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab('liturgia')}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'liturgia' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Liturgia
                        </button>
                        <button
                            onClick={() => setActiveTab('parroquia')}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'parroquia' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Parroquia {events.length > 0 && <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">{events.length}</span>}
                        </button>
                        {isSunday && (
                            <button
                                onClick={() => setActiveTab('roster')}
                                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'roster' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Roles
                            </button>
                        )}
                    </div>

                    {/* Tab: Liturgia */}
                    {activeTab === 'liturgia' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color Litúrgico</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${color.classes.replace('bg-', 'bg-').split(' ')[0].replace('100', '500')}`}></span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{color.name}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ciclo Leccionario</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cycle.text}</span>
                                </div>
                            </div>

                            {/* Daily Reminder Section */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                                    Recordatorio del Día
                                </label>
                                <textarea
                                    className="w-full bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium text-gray-700 dark:text-gray-200"
                                    placeholder="Escribe una nota o recordatorio para este día..."
                                    value={reminderForm}
                                    onChange={(e) => setReminderForm(e.target.value)}
                                    onBlur={() => updateDailyReminder(date, reminderForm)}
                                />
                            </div>

                            <button
                                onClick={() => { onGenerate(date); onClose(); }}
                                className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Generar Liturgia
                            </button>
                        </div>
                    )}

                    {/* Tab: Parroquia (Events) */}
                    {activeTab === 'parroquia' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* New Event Input */}
                            <div className="flex gap-2">
                                <select
                                    className="bg-gray-50 border border-gray-200 rounded-lg text-lg px-2"
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                >
                                    <option value="pastoral">🔵</option>
                                    <option value="finance">🟢</option>
                                    <option value="meeting">🟣</option>
                                    <option value="other">🟠</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nuevo evento..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                                />
                                <button
                                    onClick={handleAddEvent}
                                    disabled={!newEvent.title}
                                    className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>

                            {/* Events List */}
                            <div className="space-y-2">
                                {events.length === 0 && <p className="text-center text-sm text-gray-400 py-4 italic">No hay eventos programados</p>}
                                {events.map((evt) => (
                                    <div key={evt.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">
                                                {evt.type === 'pastoral' && '🔵'}
                                                {evt.type === 'finance' && '🟢'}
                                                {evt.type === 'meeting' && '🟣'}
                                                {evt.type === 'other' && '🟠'}
                                                {evt.type === 'birthday' && '🎂'}
                                                {evt.type === 'roster' && '📋'}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{evt.title}</p>
                                                {evt.isAuto && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded">Automático</span>}
                                            </div>
                                        </div>
                                        {!evt.isAuto && evt.type !== 'birthday' && evt.type !== 'roster' && (
                                            <button
                                                onClick={() => deleteEvent(evt.id)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab: Roster (Roles) - Sunday Only */}
                    {activeTab === 'roster' && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-xs text-gray-500 mb-2">Asigna los roles para este servicio dominical.</p>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Predicador / Celebrante</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Nombre..."
                                    value={rosterForm.celebrant || ''}
                                    onChange={e => handleRosterChange('celebrant', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lector (AT/Epístola)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Nombre..."
                                    value={rosterForm.lector || ''}
                                    onChange={e => handleRosterChange('lector', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Música / Salmista</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Nombre..."
                                    value={rosterForm.musician || ''}
                                    onChange={e => handleRosterChange('musician', e.target.value)}
                                />
                            </div>

                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                <span>Estos cambios se guardan automáticamente.</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
