import { useState } from 'react';
import { useSetlists } from '../../context/SetlistContext';
import { useMusic } from '../../context/MusicContext';
import SongDetail from './SongDetail';

export default function SetlistView() {
    const { setlists, createSetlist, deleteSetlist, activeSetlistId, setActiveSetlistId, removeSongFromSetlist, updateSetlist } = useSetlists();
    const { songs } = useMusic();
    const [isCreating, setIsCreating] = useState(false);
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTitle, setNewTitle] = useState('Misa Dominical');

    // For viewing a song from the list
    const [viewingSong, setViewingSong] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Fix timezone offset for date object creation if needed, or just use string
            // Storing as Date object for Firestore sorting
            const d = new Date(newDate);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); // Simple fix to keep day
            await createSetlist(d, newTitle);
            setIsCreating(false);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    const activeSetlist = setlists.find(s => s.id === activeSetlistId);

    // Helper to get full song data if needed, though we stored basics in the setlist
    const getFullSong = (entry) => {
        // We stored {id, title, key, category} in setlist. 
        // If we need full lyrics for the modal, we look it up in 'songs' from MusicContext
        return songs.find(s => s.id === entry.id) || entry;
    };

    if (activeSetlistId && activeSetlist) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setActiveSetlistId(null)}
                    className="mb-4 flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Volver a mis listas
                </button>

                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-display">{activeSetlist.title}</h2>
                            <p className="text-primary font-bold">
                                {activeSetlist.dateObj ? activeSetlist.dateObj.toLocaleDateString() : activeSetlist.date}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                title="Imprimir Lista"
                            >
                                <span className="material-symbols-outlined">print</span>
                            </button>
                        </div>
                    </div>

                    {activeSetlist.songs && activeSetlist.songs.length > 0 ? (
                        <div className="space-y-2">
                            {activeSetlist.songs.map((songEntry, idx) => (
                                <div key={songEntry.instanceId || idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-lg group">
                                    <span className="font-mono text-gray-400 text-sm w-6 text-center">{idx + 1}</span>
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => setViewingSong(getFullSong(songEntry))}
                                    >
                                        <p className="font-bold text-gray-900 dark:text-white">{songEntry.title}</p>
                                        <p className="text-xs text-gray-500 uppercase">{songEntry.category || 'General'} • {songEntry.key}</p>
                                    </div>
                                    <button
                                        onClick={() => removeSongFromSetlist(activeSetlistId, songEntry.instanceId)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 transition-opacity"
                                        title="Quitar de la lista"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">queue_music</span>
                            <p className="text-gray-500">Esta lista está vacía.</p>
                            <p className="text-xs text-primary mt-2">Ve al "Cantoral" y añade cantos a esta lista.</p>
                        </div>
                    )}
                </div>

                {viewingSong && (
                    <SongDetail song={viewingSong} onClose={() => setViewingSong(null)} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Listas Programadas</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nueva Lista
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-6">
                    <h3 className="font-bold text-sm mb-3">Crear Nueva Lista</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500">Título</label>
                            <input
                                required
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="w-full neumorphic-inset p-2"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Fecha</label>
                            <input
                                type="date"
                                required
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                className="w-full neumorphic-inset p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost text-xs">Cancelar</button>
                        <button type="submit" className="btn-primary text-xs px-4">Crear</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {setlists.map(list => (
                    <div
                        key={list.id}
                        onClick={() => setActiveSetlistId(list.id)}
                        className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:border-primary/50 transition-colors group relative"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-primary transition-colors">{list.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                                    {list.dateObj ? list.dateObj.toLocaleDateString() : list.date}
                                </p>
                            </div>
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                {list.songs ? list.songs.length : 0} cantos
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); deleteSetlist(list.id); }}
                            className="absolute bottom-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-10"
                            title="Eliminar lista"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                ))}

                {setlists.length === 0 && !isCreating && (
                    <div className="col-span-full text-center py-10 opacity-50">
                        <p>No tienes listas creadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
