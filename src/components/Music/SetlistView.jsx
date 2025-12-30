import { QRCodeSVG } from 'qrcode.react';

// ... inside component ...
const [showQR, setShowQR] = useState(false);

// ... inside activeSetlist render ...
<div className="flex gap-2">
    <button
        onClick={() => setShowQR(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-primary"
        title="Compartir con Fieles"
    >
        <span className="material-symbols-outlined">qr_code_2</span>
    </button>
    <button
        onClick={() => window.print()}
        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
        title="Imprimir Lista"
    >
        <span className="material-symbols-outlined">print</span>
    </button>
</div>
                    </div >

    {/* QR Modal */ }
{
    showQR && (
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
    )
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
