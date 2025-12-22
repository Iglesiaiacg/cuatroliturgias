import { useState, useMemo } from 'react';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import SongDetail from '../Music/SongDetail'; // To be created
import { HYMNAL } from '../../data/hymnal'; // Import DB
import { parseChordsFromText } from '../../utils/chordParser'; // Import parser

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

    // --- PASTE HANDLER ---
    const handleSmartPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const formatted = parseChordsFromText(text);
            setNewLyrics(formatted);
        } catch (err) {
            console.error(err);
            alert("No se pudo leer del portapapeles. Permiso denegado.");
        }
    };

    const handleWebSearch = () => {
        const query = encodeURIComponent(`acordes ${newTitle} letras`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };
    // ---------------------

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
        <div className="flex-1 flex flex-col h-full p-4 w-full max-w-7xl mx-auto">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    className="w-full neumorphic-inset p-2"
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
                                className="w-full sm:w-20 neumorphic-inset p-2"
                                placeholder="Tono"
                                value={newKey} onChange={e => setNewKey(e.target.value)}
                            />
                        </div>

                        {/* Lyrics Editor with Tools */}
                        <div className="relative">
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleWebSearch}
                                    disabled={!newTitle}
                                    className="p-1 px-2 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
                                    title="Buscar en Google"
                                >
                                    <span className="material-symbols-outlined text-sm">search</span>
                                    Web
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSmartPaste}
                                    className="p-1 px-2 bg-green-50 text-green-600 rounded text-xs font-bold hover:bg-green-100 flex items-center gap-1"
                                    title="Pegar y Convertir acordes de la web"
                                >
                                    <span className="material-symbols-outlined text-sm">magic_button</span>
                                    Pegar Mágico
                                </button>
                            </div>
                            <textarea
                                className="w-full neumorphic-inset p-4 h-64 font-mono text-sm"
                                placeholder={`Letra y acordes...\n[C] Ejemplo de [G] formato\n\nTambién puedes copiar de la web (acordes arriba) y usar "Pegar Mágico".`}
                                value={newLyrics}
                                onChange={e => setNewLyrics(e.target.value)}
                                required
                            />
                        </div>                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6 flex gap-2">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar canción..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        const query = encodeURIComponent(`acordes cantoral ${searchTerm} letras`);
                        window.open(`https://www.google.com/search?q=${query}`, '_blank');
                    }}
                    disabled={!searchTerm}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                    title="Buscar en Google"
                >
                    <span className="material-symbols-outlined">public</span>
                    <span className="hidden sm:inline">Buscar en Web</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(song => (
                    <div
                        key={song.id}
                        onClick={() => setSelectedSong(song)}
                        className="neumorphic-card p-4 transition-all cursor-pointer hover:-translate-y-1 group"
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
