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
    const [viewFormat, setViewFormat] = useState('grid'); // 'grid' | 'list'

    // ... (rest of methods)

    // ...

    {/* Search and Toggle Wrapper */ }
    <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input
                type="text"
                placeholder={`Buscar en ${selectedCategory === 'all' ? 'todo' : selectedCategory}...`}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl h-full items-center">
            <button
                onClick={() => setViewFormat('grid')}
                className={`p-2 rounded-lg transition-all ${viewFormat === 'grid' ? 'bg-white dark:bg-white/10 shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Cuadrícula"
            >
                <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
                onClick={() => setViewFormat('list')}
                className={`p-2 rounded-lg transition-all ${viewFormat === 'list' ? 'bg-white dark:bg-white/10 shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Lista"
            >
                <span className="material-symbols-outlined">view_list</span>
            </button>
        </div>
    </div>

    {/* Content */ }
    {
        filtered.length === 0 ? (
            <div className="text-center py-12 opacity-50">
                <span className="material-symbols-outlined text-4xl mb-2">music_off</span>
                <p>No hay cantos en esta categoría.</p>
            </div>
        ) : (
        viewFormat === 'grid' ? (
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
        ) : (
            <div className="flex flex-col gap-2">
                {filtered.map(song => (
                    <div
                        key={song.id}
                        onClick={() => setSelectedSong(song)}
                        className="bg-white dark:bg-surface-dark p-3 rounded-lg border border-gray-100 dark:border-white/5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center font-bold font-mono text-gray-500">
                                {song.key}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{song.title}</h3>
                                <div className="flex items-center gap-2">
                                    {song.category && <span className="text-[10px] uppercase tracking-wider text-gray-500">{song.category}</span>}
                                    {song.tags && song.tags.length > 0 && <span className="text-[10px] text-gray-400">• {song.tags.join(', ')}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeSetlistId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToSetlist(song);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-green-100 dark:hover:bg-green-900/40 text-gray-400 hover:text-green-600 rounded-full transition-all"
                                    title={`Añadir a lista: ${activeListName}`}
                                >
                                    <span className="material-symbols-outlined text-lg">playlist_add</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    )
    }
        </div >
    );
}
