import { useState, useMemo } from 'react';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import SongDetail from '../Music/SongDetail'; // To be created
import { HYMNAL } from '../../data/hymnal'; // Import DB

export default function MusicView() {
    const { songs, addSong } = useMusic();
    const { userRole, checkPermission } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSong, setSelectedSong] = useState(null); // If not null, showing detail
    const [isCreating, setIsCreating] = useState(false);

    // New Song State
    const [newTitle, setNewTitle] = useState('');
    const [newKey, setNewKey] = useState('C');
    const [newLyrics, setNewLyrics] = useState('');

    // --- SMART SEARCH (AUTOCOMPLETE) ---
    const [suggestions, setSuggestions] = useState([]);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setNewTitle(val);
        if (val.length > 2) {
            const matches = HYMNAL.filter(h => h.title.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (hymn) => {
        setNewTitle(hymn.title);
        setNewKey(hymn.key);
        setNewLyrics(hymn.lyrics);
        setSuggestions([]); // Close
    };
    // -----------------------------------

    const filtered = songs.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveNew = (e) => {
        e.preventDefault();
        addSong({ title: newTitle, key: newKey, lyrics: newLyrics });
        setIsCreating(false);
        setNewTitle('');
        setNewLyrics('');
        setSuggestions([]);
    };

    // If detail view
    if (selectedSong) {
        return <SongDetail song={selectedSong} onClose={() => setSelectedSong(null)} />;
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-black/20 p-4 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Cantoral</h1>
                    <p className="text-sm text-gray-500">Repertorio musical</p>
                </div>
                {(checkPermission && checkPermission('manage_music') || userRole === 'admin') && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-800 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="hidden sm:inline">Nuevo Canto</span>
                    </button>
                )}
            </div>

            {/* Creating */}
            {isCreating && (
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm mb-6 animate-fade-in-up border border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-lg mb-4">Agregar Nuevo Canto</h3>
                    <form onSubmit={handleSaveNew} className="space-y-4 relative">
                        {/* Hints Container */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    className="w-full p-2 border rounded-lg dark:bg-black/20 dark:border-white/10"
                                    placeholder="Título (Escribe para buscar...)"
                                    value={newTitle}
                                    onChange={handleTitleChange} // Use wrapper
                                    required
                                    autoComplete="off"
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 mt-1 max-h-40 overflow-y-auto">
                                        <div className="p-2 text-xs text-gray-500 font-bold uppercase bg-gray-50 dark:bg-white/5">Sugerencias del Himnario</div>
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => selectSuggestion(s)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-sm flex justify-between"
                                            >
                                                <span>{s.title}</span>
                                                <span className="text-gray-400 font-mono text-xs">{s.key}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                className="w-20 p-2 border rounded-lg dark:bg-black/20 dark:border-white/10"
                                placeholder="Tono"
                                value={newKey} onChange={e => setNewKey(e.target.value)}
                            />
                        </div>
                        <textarea
                            className="w-full p-2 border rounded-lg h-32 font-mono text-sm dark:bg-black/20 dark:border-white/10"
                            placeholder="Letra con acordes: [C] Hola [G] Mundo..."
                            value={newLyrics} onChange={e => setNewLyrics(e.target.value)} required
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                    type="text"
                    placeholder="Buscar canción..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(song => (
                    <div
                        key={song.id}
                        onClick={() => setSelectedSong(song)}
                        className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">{song.title}</h3>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500">{song.key}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2 font-serif italic">
                            {song.lyrics.replace(/\[.*?\]/g, '')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
