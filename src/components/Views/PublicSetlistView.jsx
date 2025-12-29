import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { parseChordsFromText } from '../../utils/chordParser';

export default function PublicSetlistView({ setlistId }) {
    const [setlist, setSetlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        const fetchSetlist = async () => {
            try {
                const docRef = doc(db, 'setlists', setlistId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSetlist({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Lista no encontrada.");
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar la lista.");
            } finally {
                setLoading(false);
            }
        };

        if (setlistId) fetchSetlist();
    }, [setlistId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-primary">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4 text-center">
            <div>
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">error</span>
                <p className="text-gray-600 font-bold">{error}</p>
            </div>
        </div>
    );

    const formatLyrics = (lyrics) => {
        // Strip chords [C] for public view (Congregation doesn't need chords usually)
        // Or maybe a toggle? Let's just strip them for cleanliness as requested "Digital Bulletin" usually implies text.
        // Actually, user might want to sing along, lyrics are fine.
        return lyrics.replace(/\[.*?\]/g, '');
    };

    // Formatting Date
    const dateObj = setlist.date && setlist.date.toDate ? setlist.date.toDate() : new Date(setlist.date);
    const dateStr = dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="min-h-screen bg-paper-pattern bg-fixed font-serif pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3 shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="font-bold font-display text-gray-900 dark:text-white leading-tight">
                        {setlist.title}
                    </h1>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider capitalize">
                        {dateStr}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFontSize(s => Math.max(12, s - 2))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full"
                    >A-</button>
                    <button
                        onClick={() => setFontSize(s => Math.min(32, s + 2))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full"
                    >A+</button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto p-4 space-y-8" style={{ fontSize: `${fontSize}px` }}>

                {(!setlist.songs || setlist.songs.length === 0) && (
                    <div className="text-center py-10 opacity-50 text-base">
                        <p>No hay cantos en esta lista.</p>
                    </div>
                )}

                {setlist.songs && setlist.songs.map((song, idx) => {
                    // We need the full lyrics. 
                    // In SetlistContext we stored basic info {id, title, key, category}. 
                    // BUT for public view, we don't have access to the full Context 'songs' if unauthenticated easily without re-fetching everything.
                    // Wait, SetlistContext saved: { id, title, key, category }. It did NOT save lyrics inside the setlist array to save space.
                    // CRITICAL: We need to fetch the lyrics for each song.
                    // Since this is a public view, we should probably fetch the referenced songs.
                    // OR, better, when adding to setlist, we *could* snapshot the lyrics.
                    // Given the current architecture, let's look at `SetlistContext.jsx`:
                    /* 
                        const songEntry = {
                            id: song.id, // Original Song ID
                            title: song.title,
                            key: song.key,
                            category: song.category || 'general',
                            instanceId: crypto.randomUUID() 
                        };
                    */
                    // The lyrics are missing!

                    // RETROACTIVE FIX: We need to either:
                    // 1. Update SetlistContext to store lyrics (best for consistency if original song changes? or worst?). 
                    //    Actually snapshotting is good for "this version of the song".
                    // 2. Or fetch each song in this component.

                    // Let's implement a sub-component that fetches song details or fetch all.
                    return (
                        <SetlistSongItem key={idx} songData={song} />
                    );
                })}

                <div className="text-center pt-8 pb-4 opacity-50 text-xs font-sans">
                    <p>Cuatro Liturgias • Digital Bulletin</p>
                </div>
            </div>
        </div>
    );
}

function SetlistSongItem({ songData }) {
    const [fullSong, setFullSong] = useState(null);

    useEffect(() => {
        const fetchSong = async () => {
            // Retrieve from 'songs' collection
            try {
                const docRef = doc(db, 'songs', songData.id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setFullSong(snap.data());
                }
            } catch (e) {
                console.error("Error fetching song details", e);
            }
        };
        fetchSong();
    }, [songData.id]);

    if (!fullSong) return (
        <div className="animate-pulse flex space-x-4 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
    );

    const cleanLyrics = fullSong.lyrics.replace(/\[.*?\]/g, '');

    return (
        <div className="mb-8 border-b border-gray-100 dark:border-white/5 pb-6 last:border-0">
            <div className="flex justify-between items-baseline mb-3">
                <h2 className="font-bold text-xl text-primary">{songData.title}</h2>
                <span className="text-[10px] uppercase tracking-wider text-gray-400">{songData.category}</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                {cleanLyrics}
            </div>
        </div>
    );
}
