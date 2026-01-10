import { useState, useEffect } from 'react';

function CopyableText({ text }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        // Toast could go here
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors group"
            title="Copiar"
        >
            <span className="font-mono font-bold select-all">{text}</span>
            <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
        </button>
    );
}

export default function DigitalOfferingCard({ showBack, onBack, settings, onUpdate, isAdmin }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(settings);
    const [saving, setSaving] = useState(false);

    // Update edit form when settings change externally
    useEffect(() => {
        setEditForm(settings);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate(editForm);
            setIsEditing(false);
        } catch (e) {
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-4 pt-2 overflow-y-auto no-scrollbar animate-fade-in w-full max-w-md mx-auto relative h-full">
            <div className="w-full flex justify-between items-center mb-4">
                {showBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver a Tesorería
                    </button>
                ) : <div />}

                {isAdmin && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isEditing ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-800 hover:bg-red-100'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                        {isEditing ? 'Cancelar' : 'Editar Datos'}
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 flex-shrink-0 mb-32 animate-slide-in">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        Configurar Ofrenda
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cuenta</label>
                            <input
                                type="text"
                                value={editForm.account}
                                onChange={(e) => setEditForm({ ...editForm, account: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="Número de cuenta (10 dígitos)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CLABE</label>
                            <input
                                type="text"
                                value={editForm.clabe}
                                onChange={(e) => setEditForm({ ...editForm, clabe: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="CLABE Interbancaria (18 dígitos)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Beneficiario</label>
                            <input
                                type="text"
                                value={editForm.beneficiary}
                                onChange={(e) => setEditForm({ ...editForm, beneficiary: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                                placeholder="Nombre de la Institución/Cuenta"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full btn-primary rounded-xl py-3 justify-center text-sm mt-4 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden relative flex-shrink-0 mb-32">
                    {/* Decorative Header */}
                    <div className="h-28 bg-gradient-to-br from-red-600 to-red-800 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg animate-pulse-slow">volunteer_activism</span>
                    </div>

                    <div className="p-6 text-center relative">
                        {/* Avatar/Logo overlapping */}
                        <div className="w-14 h-14 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg absolute -top-7 left-1/2 -translate-x-1/2 border-2 border-white dark:border-stone-800">
                            <span className="material-symbols-outlined text-primary text-2xl">church</span>
                        </div>

                        <h2 className="mt-8 text-xl font-display font-bold text-gray-900 dark:text-white mb-1">Ofrenda Digital</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                            &quot;Dios ama al dador alegre.&quot;<br /><span className="text-[10px] italic">- 2 Corintios 9:7</span>
                        </p>

                        <div className="space-y-3 text-left">
                            {/* Bank Details */}
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Transferencia / Depósito</p>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">BBVA Bancomer</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 ml-11">
                                    <p className="text-sm flex justify-between gap-4">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Cuenta:</span>
                                        <CopyableText text={settings.account} />
                                    </p>
                                    <p className="text-sm flex justify-between gap-4">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">CLABE:</span>
                                        <CopyableText text={settings.clabe} />
                                    </p>
                                    <p className="text-sm flex flex-col items-end">
                                        <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold w-full text-left">Beneficiario:</span>
                                        <span className="font-medium text-right text-gray-900 dark:text-white leading-tight">{settings.beneficiary}</span>
                                    </p>
                                </div>
                            </div>

                            {/* QR Instructions */}
                            <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                                <div className="qr-placeholder w-16 h-16 bg-white p-1 rounded-lg shrink-0 shadow-sm">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${settings.clabe}`} alt="QR Bancario" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[11px] text-red-800 dark:text-red-200 leading-tight">
                                    Escanea este código desde tu App Bancaria para donar rápidamente.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button className="btn-secondary w-full justify-center text-xs py-2.5 rounded-2xl">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    Compartir
                                </button>
                                <button className="btn-primary w-full justify-center text-xs py-2.5 rounded-2xl bg-red-800 hover:bg-red-900 text-white border-none shadow-red-200 dark:shadow-none">
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    Reportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
