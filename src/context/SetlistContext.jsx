import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const SetlistContext = createContext();

export function useSetlists() {
    return useContext(SetlistContext);
}

export function SetlistProvider({ children }) {
    const { currentUser } = useAuth();
    const [setlists, setSetlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSetlistId, setActiveSetlistId] = useState(null); // ID of the setlist currently being edited/viewed

    // Subscribe to Setlists
    useEffect(() => {
        if (!currentUser) {
            setSetlists([]);
            setLoading(false);
            return;
        }

        // Avoid infinite loops if permission is denied permanently
        if (error && error.includes('permission')) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'setlists'), orderBy('date', 'desc'));

        let unsubscribe = () => { };

        try {
            unsubscribe = onSnapshot(q, (snapshot) => {
                const list = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        dateObj: data.date && data.date.toDate ? data.date.toDate() : new Date(data.date)
                    };
                });
                setSetlists(list);
                setLoading(false);
                setError(null); // Clear error on success
            }, (err) => {
                console.error("Setlist Sync Error:", err);
                // If it's a permission error, set explicit error and STOP trying
                if (err.code === 'permission-denied') {
                    setError("Permisos insuficientes para ver los cantorales. (permission-denied)");
                } else {
                    setError(err.message);
                }
                setLoading(false);
            });
        } catch (e) {
            console.error("Setup Error:", e);
            setError(e.message);
            setLoading(false);
        }

        return () => unsubscribe();
    }, [currentUser]); // Removed 'error' from dependency to avoid loop, but if we want to retry we need a manual trigger


    const createSetlist = async (date, title = "Misa Dominical") => {
        try {
            const docRef = await addDoc(collection(db, 'setlists'), {
                date: date, // Should be a JS Date object or Timestamp
                title: title,
                songs: [], // Array of song objects or IDs. Storing minimal data {id, title, key, category} is often better for performance than just IDs, but syncing is harder. Let's store full objects for simplicity in this MVP.
                notes: '',
                createdBy: auth.currentUser?.email,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error creating setlist:", e);
            throw e;
        }
    };

    const updateSetlist = async (id, updates) => {
        try {
            await updateDoc(doc(db, 'setlists', id), {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Error updating setlist:", e);
            throw e;
        }
    };

    const deleteSetlist = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta lista?")) return;
        try {
            await deleteDoc(doc(db, 'setlists', id));
            if (activeSetlistId === id) setActiveSetlistId(null);
        } catch (e) {
            console.error("Error deleting setlist:", e);
            throw e;
        }
    };

    const addSongToSetlist = async (setlistId, song) => {
        // Find current setlist to append
        const current = setlists.find(s => s.id === setlistId);
        if (!current) return;

        // Create a minimal song object to store in the list
        const songEntry = {
            id: song.id, // Original Song ID
            title: song.title,
            key: song.key,
            category: song.category || 'general',
            instanceId: crypto.randomUUID() // Unique ID for this instance in the list (allows duplicates)
        };

        const newSongs = [...(current.songs || []), songEntry];

        await updateSetlist(setlistId, { songs: newSongs });
    };

    const removeSongFromSetlist = async (setlistId, instanceId) => {
        const current = setlists.find(s => s.id === setlistId);
        if (!current) return;

        const newSongs = current.songs.filter(s => s.instanceId !== instanceId);
        await updateSetlist(setlistId, { songs: newSongs });
    };

    const reorderSetlist = async (setlistId, newSongsArray) => {
        await updateSetlist(setlistId, { songs: newSongsArray });
    };

    const getSetlist = (id) => setlists.find(s => s.id === id);

    const value = {
        setlists,
        activeSetlistId,
        setActiveSetlistId,
        createSetlist,
        updateSetlist,
        deleteSetlist,
        addSongToSetlist,
        removeSongFromSetlist,
        reorderSetlist,
        getSetlist,
        loading,
        error
    };

    return (
        <SetlistContext.Provider value={value}>
            {children}
        </SetlistContext.Provider>
    );
}
