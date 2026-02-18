import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const MusicContext = createContext();

export function useMusic() {
    return useContext(MusicContext);
}

export function MusicProvider({ children }) {
    const { currentUser } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Preferencias de UI persistentes
    const [notationSystem, setNotationSystem] = useState(() => localStorage.getItem('music_notation_system') || 'american');


    // Helper: Migrate local to cloud
    const migrateSongs = useCallback(async (localList) => {
        for (const song of localList) {
            try {
                const { id, ...data } = song;
                await addDoc(collection(db, 'songs'), {
                    ...data,
                    migratedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Error migrating song:", song.title, e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('music_notation_system', notationSystem);
    }, [notationSystem]);

    const toggleNotation = () => {
        setNotationSystem(prev => prev === 'american' ? 'latin' : 'american');
    };

    // Load songs from Firestore with Real-time listener
    useEffect(() => {
        if (!currentUser) {
            setSongs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'songs'), orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cloudSongs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSongs(cloudSongs);
            setLoading(false);

            // One-time migration check (could be optimized)
            try {
                const localData = localStorage.getItem('liturgia_songs');
                if (localData) {
                    const localSongs = JSON.parse(localData);
                    if (localSongs.length > 0) {
                        migrateSongs(localSongs);
                        localStorage.removeItem('liturgia_songs'); // Clear after migration
                    }
                }
            } catch (e) {
                console.error("Migration parse error", e);
            }

        }, (error) => {
            console.error("Error fetching songs:", error);
            setError(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, migrateSongs]);



    const addSong = useCallback(async (song) => {
        try {
            await addDoc(collection(db, 'songs'), {
                ...song, // Includes title, key, lyrics, category, tags
                tags: song.tags || [],
                createdBy: auth.currentUser?.email || 'anonymous',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Error adding song:", e);
            throw e;
        }
    }, []);

    const updateSong = useCallback(async (id, updates) => {
        try {
            await updateDoc(doc(db, 'songs', id), {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Error updating song:", e);
            throw e;
        }
    }, []);

    const deleteSong = useCallback(async (id) => {
        try {
            await deleteDoc(doc(db, 'songs', id));
        } catch (e) {
            console.error("Error deleting song:", e);
            throw e;
        }
    }, []);

    const getSongsByCategory = useCallback((category) => {
        return songs.filter(s => s.category === category);
    }, [songs]);

    // --- ANNOTATIONS (User Specific) ---
    // Saved in users/{uid}/annotations/{songId}
    const saveAnnotation = useCallback(async (songId, content) => {
        if (!auth.currentUser) return;
        try {
            const ref = doc(db, `users/${auth.currentUser.uid}/annotations/${songId}`);
            await setDoc(ref, {
                content,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Error saving annotation:", e);
        }
    }, []);

    const getAnnotation = useCallback(async (songId) => {
        if (!auth.currentUser) return '';
        try {
            const ref = doc(db, `users/${auth.currentUser.uid}/annotations/${songId}`);
            const snap = await getDoc(ref);
            return snap.exists() ? snap.data().content : '';
        } catch (e) {
            console.error("Error fetching annotation:", e);
            return '';
        }
    }, []);

    const value = useMemo(() => ({
        songs,
        addSong,
        updateSong,
        deleteSong,
        loading,
        error,
        notationSystem,
        setNotationSystem,
        toggleNotation,
        getSongsByCategory,
        saveAnnotation,
        getAnnotation
    }), [songs, addSong, updateSong, deleteSong, loading, error, notationSystem, getSongsByCategory, saveAnnotation, getAnnotation]);

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}
