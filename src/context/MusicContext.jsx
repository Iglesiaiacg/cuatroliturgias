import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const MusicContext = createContext();

export function useMusic() {
    return useContext(MusicContext);
}

export function MusicProvider({ children }) {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('liturgia_songs');
        if (stored) {
            try {
                setSongs(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing songs", e);
            }
        } else {
            // Seed some data for demo if empty
            const seed = [
                { id: '1', title: 'Pescador de Hombres', key: 'C', lyrics: '[C] Tú has venido a la [G] orilla,\n[F] no has buscado ni a [G] sabios ni a ricos,\n[C] tan solo [G] quieres que yo te [C] siga.\n\n[C] Señor, [F] me has mirado a los [C] ojos...' },
                { id: '2', title: 'Cordero de Dios', key: 'G', lyrics: '[G] Cordero de Dios que [C] quitas\nel pe[D]cado del [G] mundo,\n[C] ten pie[D]dad de no[G]sotros.' }
            ];
            setSongs(seed);
            localStorage.setItem('liturgia_songs', JSON.stringify(seed));
        }
        setLoading(false);
    }, []);

    // Save on change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('liturgia_songs', JSON.stringify(songs));
        }
    }, [songs, loading]);

    const addSong = (song) => {
        const newSong = { ...song, id: uuidv4(), updatedAt: new Date().toISOString() };
        setSongs(prev => [...prev, newSong]);
    };

    const updateSong = (id, updates) => {
        setSongs(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    };

    const deleteSong = (id) => {
        setSongs(prev => prev.filter(s => s.id !== id));
    };

    const value = {
        songs,
        addSong,
        updateSong,
        deleteSong,
        loading
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}
