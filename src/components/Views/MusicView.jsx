import { useState, useMemo } from 'react';
import { useMusic } from '../../context/MusicContext';
import { useSetlists } from '../../context/SetlistContext'; // Import Setlist Context
import { useAuth } from '../../context/AuthContext';
import SongDetail from '../Music/SongDetail';
import SetlistView from '../Music/SetlistView'; // Import new component
import { HYMNAL } from '../../data/hymnal';
import { parseChordsFromText } from '../../utils/chordParser';
import { getSeason, getLiturgicalCycle } from '../../services/liturgy';

const CATEGORIES = [
    { id: 'all', label: 'Todo' },
    { id: 'entrada', label: 'Entrada' },
    { id: 'kyrie', label: 'Kyrie' },
    { id: 'gloria', label: 'Gloria' },
    { id: 'salmo', label: 'Salmo' },
    { id: 'aleluya', label: 'Aleluya' },
    { id: 'ofertorio', label: 'Ofertorio' },
    { id: 'santo', label: 'Santo' },
    { id: 'cordero', label: 'Cordero' },
    { id: 'comunion', label: 'Comunión' },
    { id: 'salida', label: 'Salida' }
];

export default function MusicView() {
    const { songs, addSong, notationSystem, toggleNotation } = useMusic();
    const { userRole, checkPermission } = useAuth();
    const { activeSetlistId, addSongToSetlist, setlists } = useSetlists(); // Use Setlist hooks

    const [viewMode, setViewMode] = useState('songs'); // 'songs' | 'setlists'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSong, setSelectedSong] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // New Song Form State
    const [newTitle, setNewTitle] = useState('');
    const [newKey, setNewKey] = useState('C');
    const [newCategory, setNewCategory] = useState('entrada');
    const [newLyrics, setNewLyrics] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Liturgical Context for Suggestions
    const today = new Date();
    const currentSeason = getSeason(today);
    const seasonLabel = currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);

    const handleWebSearch = () => {
        const query = encodeURIComponent(`acordes ${newTitle} letras`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

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
        if (hymn.category) setNewCategory(hymn.category);
        setSuggestions([]);
    };

    const filtered = songs.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSaveNew = (e) => {
        e.preventDefault();
        addSong({
            title: newTitle,
            key: newKey,
            lyrics: newLyrics,
            category: newCategory
        });
        setIsCreating(false);
        setNewTitle('');
        setNewLyrics('');
        setSuggestions([]);
    };

    // Helper to add song to ACTIVE setlist 
    const handleAddToSetlist = async (song) => {
        if (!activeSetlistId) {
            alert("Primero selecciona o crea una lista en la pestaña 'Listas'.");
            return;
        }
        await addSongToSetlist(activeSetlistId, song);
        alert(`"${song.title}" añadido a la lista.`);
    };

    // Find active setlist name for UI feedback
    const activeListName = setlists.find(s => s.id === activeSetlistId)?.title;

    if (selectedSong) {
        return (
            <SongDetail
                song={selectedSong}
                onClose={() => setSelectedSong(null)}
                // Pass extra actions if we wanted, but context is better.
                // We'll pass a custom action for the toolbar
                onAddToSetlist={() => handleAddToSetlist(selectedSong)}
                activeListName={activeListName}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full p-4 w-full max-w-7xl mx-auto pb-24">
            {/* Header with Navigation and Notation Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Cantoral</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span>Tiempo: <span className="font-bold text-primary">{seasonLabel}</span></span>
                        </p>
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('songs')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'songs' ? 'bg-white dark:bg-white/10 shadow text-primary' : 'text-gray-500'}`}
                            >
                                Cantos
                            </button>
                            <button
                                onClick={() => setViewMode('setlists')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'setlists' ? 'bg-white dark:bg-white/10 shadow text-primary' : 'text-gray-500'}`}
                            >
                                Listas {activeSetlistId && <span className="w-2 h-2 bg-green-500 rounded-full inline-block ml-1"></span>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleNotation}
                        className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
                        title={notationSystem === 'american' ? "Cambiar a Do-Re-Mi" : "Cambiar a C-D-E"}
                    >
                        <span className="material-symbols-outlined text-sm">music_note</span>
                        <span>{notationSystem === 'american' ? 'C D E' : 'Do Re Mi'}</span>
                    </button>
                    {(checkPermission && checkPermission('manage_music') || userRole === 'admin') && viewMode === 'songs' && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn-primary"
                        >
                            <span className="material-symbols-outlined">add</span>
                            <span className="hidden sm:inline">Nuevo Canto</span>
                        </button>
                    )}
                </div>
            </div>

            {/* View Switching */}
            {viewMode === 'setlists' ? (
                <SetlistView />
            ) : (
                /* SONGS VIEW */
                <>
                    {/* LITURGICAL SUGGESTIONS (Only when not searching/filtering specific categories) */}
                    {viewMode === 'songs' && selectedCategory === 'all' && !searchTerm && (
                        <div className="mb-8 animate-fade-in">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                                    Sugeridos para {seasonLabel}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {songs
                                    .filter(s => s.tags && s.tags.includes(currentSeason))
                                    .slice(0, 3) // Limit to 3 suggestions
                                    .map(song => (
                                        <div
                                            key={song.id}
                                            onClick={() => setSelectedSong(song)}
                                            className="neumorphic-card p-4 cursor-pointer hover:-translate-y-1 transition-all border-l-4 border-primary bg-yellow-50/50 dark:bg-yellow-900/10"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{song.title}</h4>
                                                <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                                                    {song.key}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-1 italic">
                                                {song.lyrics.replace(/\[.*?\]/g, '')}
                                            </p>
                                        </div>
                                    ))}
                                {songs.filter(s => s.tags && s.tags.includes(currentSeason)).length === 0 && (
                                    <div className="col-span-full p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-sm text-gray-500">
                                        No hay sugerencias específicas para este tiempo aún.
                                        <br />
                                        <span className="text-xs opacity-70">Añade etiquetas como "{currentSeason}" a tus cantos.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                                    ${selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-md transform scale-105'
                                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                                `}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Create Form */}
                    {isCreating && (
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm mb-6 animate-fade-in-up border border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-lg mb-4">Agregar Nuevo Canto</h3>
                            <form onSubmit={handleSaveNew} className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            className="w-full neumorphic-inset p-2"
                                            placeholder="Título..."
                                            value={newTitle}
                                            onChange={handleTitleChange}
                                            required
                                            autoComplete="off"
                                        />
                                        {/* Suggestions Dropdown */}
                                        {suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 mt-1 max-h-40 overflow-y-auto">
                                                <div className="p-2 text-xs text-gray-600 font-bold uppercase bg-gray-50 dark:bg-white/5">Sugerencias del Himnario</div>
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => selectSuggestion(s)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-sm flex justify-between"
                                                    >
                                                        <span>{s.title}</span>
                                                        <span className="text-gray-500 font-mono text-xs">{s.key}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        className="w-full sm:w-40 neumorphic-inset p-2"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                    >
                                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="w-full sm:w-20 neumorphic-inset p-2 text-center font-mono font-bold"
                                        placeholder="Tono"
                                        value={newKey} onChange={e => setNewKey(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleWebSearch}
                                            className="btn-secondary !text-blue-600 !bg-blue-50 hover:!bg-blue-100 flex items-center gap-1 text-xs px-2 py-1 h-auto"
                                        >
                                            <span className="material-symbols-outlined text-sm">search</span>Web
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                    setNewLyrics(parseChordsFromText(text));
                                                } catch (e) { alert("Permiso denegado"); }
                                            }}
                                            className="btn-secondary !text-green-600 !bg-green-50 hover:!bg-green-100 flex items-center gap-1 text-xs px-2 py-1 h-auto"
                                        >
                                            <span className="material-symbols-outlined text-sm">magic_button</span>Pegar
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full neumorphic-inset p-4 h-64 font-mono text-sm"
                                        placeholder={`Letra y acordes...\n[C] Ejemplo\nPegar Mágico formateará texto de la web.`}
                                        value={newLyrics}
                                        onChange={e => setNewLyrics(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost">Cancelar</button>
                                    <button type="submit" className="btn-primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder={`Buscar en ${selectedCategory === 'all' ? 'todo' : selectedCategory}...`}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">music_off</span>
                            <p>No hay cantos en esta categoría.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(song => (
                                <div
                                    key={song.id}
                                    onClick={() => setSelectedSong(song)}
                                    className="neumorphic-card p-4 transition-all cursor-pointer hover:-translate-y-1 group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 p-2 opacity-10 font-bold text-4xl uppercase select-none`}>
                                        {song.key}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">{song.title}</h3>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            {song.category && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500">
                                                    {song.category}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                                                {song.key}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 font-serif italic">
                                            {song.lyrics.replace(/\[.*?\]/g, '')}
                                        </p>
                                    </div>

                                    {/* Quick Add Button if setlist active */}
                                    {activeSetlistId && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToSetlist(song);
                                            }}
                                            className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-green-100 dark:hover:bg-green-900/40 text-gray-400 hover:text-green-600 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            title={`Añadir a lista: ${activeListName}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
