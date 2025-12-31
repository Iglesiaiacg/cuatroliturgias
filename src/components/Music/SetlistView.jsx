import { useState } from 'react';
import { useSetlists } from '../../context/SetlistContext';
import { useMusic } from '../../context/MusicContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { generateSetlistPDF } from '../../utils/pdfGenerator';
import SongDetail from './SongDetail';
import { QRCodeSVG } from 'qrcode.react';

export default function SetlistView() {
    const { setlists, createSetlist, deleteSetlist, activeSetlistId, setActiveSetlistId, removeSongFromSetlist, reorderSetlist } = useSetlists();
    const { songs } = useMusic();
    const [isCreating, setIsCreating] = useState(false);
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTitle, setNewTitle] = useState('Misa Dominical');
    const [showQR, setShowQR] = useState(false);

    // For viewing a song from the list
    const [viewingSong, setViewingSong] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Fix timezone offset for date object creation if needed
            const d = new Date(newDate);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            await createSetlist(d, newTitle);
            setIsCreating(false);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    const activeSetlist = setlists.find(s => s.id === activeSetlistId);

    // Helper to get full song data if needed
    const getFullSong = (entry) => {
        return songs.find(s => s.id === entry.id) || entry;
    };

    // DnD Sensors - Optimized for Mobile (delay/distance to allow scrolling)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function SortableItem({ id, songEntry, idx, onClick, onRemove, activeListName }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging
        } = useSortable({ id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 50 : 'auto',
            position: 'relative',
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 p-3 rounded-lg flex justify-between items-center mb-2 shadow-sm ${isDragging ? 'shadow-xl ring-2 ring-primary opacity-90' : 'hover:border-primary/30'} touch-none`}
            >
                <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={onClick}>
                    <div className="bg-gray-100 dark:bg-white/5 text-gray-400 p-2 rounded cursor-grab active:cursor-grabbing">
                        <span className="material-symbols-outlined text-lg">drag_indicator</span>
                    </div>
                    <div className="flex-1 truncate">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-400 w-5 text-center">{idx + 1}</span>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{songEntry.title}</h4>
                        </div>
                        {songEntry.artist && <p className="text-xs text-gray-500 truncate ml-7">{songEntry.artist}</p>}
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag/click when deleting
                        // We need to implement remove on parent or handle it here?
                        // The parent passed onRemove
                        onRemove();
                    }}
                    className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        );
    }

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = activeSetlist.songs.findIndex((item) => item.instanceId === active.id);
            const newIndex = activeSetlist.songs.findIndex((item) => item.instanceId === over.id);

            // Optimistic update handled by context via arrayMove logic passed down?
            // Actually context creates a new array and saves it.
            // We need to call reorderSetlist
            const newOrder = arrayMove(activeSetlist.songs, oldIndex, newIndex);
            // We need to call reorderSetlist from context
            // But wait, the context method is async.
            // Ideally we should have local state or context handles it fast.
            // Let's grab reorderSetlist from context.
            reorderSetlist(activeSetlistId, newOrder);
        }
    };

    const handleDownloadPDF = () => {
        const fullSongs = activeSetlist.songs.map(entry => getFullSong(entry)).filter(Boolean);
        generateSetlistPDF(activeSetlist, fullSongs);
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
                                onClick={() => setShowQR(true)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-primary"
                                title="Compartir con Fieles"
                            >
                                <span className="material-symbols-outlined">qr_code_2</span>
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
                                title="Descargar PDF para Músicos"
                            >
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
                                title="Imprimir Lista"
                            >
                                <span className="material-symbols-outlined">print</span>
                            </button>
                        </div>
                    </div>

                    {activeSetlist.songs && activeSetlist.songs.length > 0 ? (
                        <div className="space-y-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={activeSetlist.songs.map(s => s.instanceId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {activeSetlist.songs.map((songEntry, idx) => (
                                        <SortableItem
                                            key={songEntry.instanceId || idx}
                                            id={songEntry.instanceId}
                                            songEntry={songEntry}
                                            idx={idx}
                                            onClick={() => setViewingSong(getFullSong(songEntry))}
                                            onRemove={() => removeSongFromSetlist(activeSetlistId, songEntry.instanceId)}
                                            activeListName={activeSetlist.title}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
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

                {/* QR Modal */}
                {showQR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative pointer-events-auto">
                            <button
                                onClick={() => setShowQR(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <h3 className="text-xl font-bold font-display mb-2 text-gray-900 dark:text-white">Boletín Digital</h3>
                            <p className="text-sm text-gray-500 mb-6">Escanea para seguir los cantos</p>

                            <div className="bg-white p-4 rounded-xl shadow-inner inline-block mb-6 border border-gray-100">
                                <QRCodeSVG
                                    value={`${window.location.origin}/#public/setlist/${activeSetlistId}`}
                                    size={200}
                                    level="M"
                                    includeMargin
                                />
                            </div>

                            <p className="text-xs text-gray-400 font-mono break-all bg-gray-50 dark:bg-black/20 p-2 rounded select-all">
                                {`${window.location.origin}/#public/setlist/${activeSetlistId}`}
                            </p>
                        </div>
                    </div>
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
