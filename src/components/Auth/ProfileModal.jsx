import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getApiKey, saveApiKey } from '../../services/storage';

export default function ProfileModal({ isOpen, onClose, rubricLevel, onRubricChange }) {
    const { currentUser, userRole, logout } = useAuth();

    // API Key State
    const [apiKey, setApiKey] = useState(() => getApiKey());
    const [keySaved, setKeySaved] = useState(false);

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Save API Key if changed
        if (apiKey !== getApiKey()) {
            saveApiKey(apiKey.trim());
            setKeySaved(true);
        }

        try {
            // Update Auth Profile
            if (displayName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName });

                // Also update Firestore 'users' collection for consistency
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, { displayName });

                setMessage('Nombre actualizado correctamente.');
            }

            // Update Password
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error("La contraseña debe tener al menos 6 caracteres.");
                }
                await updatePassword(currentUser, newPassword);
                setMessage((prev) => prev + (prev ? ' ' : '') + 'Contraseña actualizada.');
                setNewPassword('');
            }

            if (!message && displayName === currentUser.displayName && !newPassword && !keySaved) {
                setMessage('No hubo cambios.');
            }

        } catch (err) {
            console.error(err);
            if (err.code === 'auth/requires-recent-login') {
                setError('Por seguridad, debes volver a iniciar sesión para cambiar la contraseña.');
            } else {
                setError('Error: ' + err.message);
            }
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-[var(--bg-main)] rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col border-none">

                {/* Header */}
                <div className="p-6 flex justify-between items-center bg-[var(--bg-main)]">
                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        Mi Perfil
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    <div className="neumorphic-card p-4 rounded-xl flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center text-primary font-bold text-lg">
                            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.email}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rol: {userRole}</p>
                        </div>
                        {userRole === 'guest' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm("¿Usar permisos de Desarrollo para ser Admin?")) {
                                        setLoading(true);
                                        try {
                                            const { setDoc, doc } = await import('firebase/firestore');
                                            await setDoc(doc(db, 'users', currentUser.uid), {
                                                email: currentUser.email,
                                                role: 'admin',
                                                displayName: displayName || 'Admin'
                                            }, { merge: true });
                                            window.location.reload();
                                        } catch (e) {
                                            alert("Error: " + e.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded shadow hover:bg-blue-700"
                            >
                                Ser Admin
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">

                        {/* Global Settings Section */}
                        <div className="neumorphic-card p-4 space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ajustes Globales</h3>

                            {/* Rubric Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Modo Director de Culto</p>
                                    <p className="text-[10px] text-gray-500">Muestra todas las instrucciones ceremoniales.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRubricChange(rubricLevel === 'simple' ? 'solemn' : 'simple')}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${rubricLevel === 'solemn' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${rubricLevel === 'solemn' ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* API Key */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Google API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => { setApiKey(e.target.value); setKeySaved(false); }}
                                    placeholder="Clave API (Opcional si usa .env)"
                                    className="w-full neumorphic-inset p-2 text-xs font-mono outline-none bg-transparent"
                                />
                                <p className="text-[9px] text-gray-400 mt-1">Dejar vacío para usar configuración del servidor.</p>
                            </div>
                        </div>

                        {/* Profile Fields */}
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Datos Personales</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nombre para Mostrar</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full neumorphic-inset p-2 text-sm outline-none bg-transparent"
                                placeholder="Ej: Padre Juan"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nueva Contraseña (Opcional)</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full neumorphic-inset p-2 text-sm outline-none bg-transparent"
                                placeholder="Dejar en blanco para no cambiar"
                            />
                        </div>

                        {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded">{error}</p>}
                        {message && <p className="text-xs text-green-600 font-bold bg-green-50 p-2 rounded">{message}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full neumorphic-btn py-2.5 font-bold shadow-sm transition-opacity disabled:opacity-50 text-gray-900 dark:text-gray-100"
                            >
                                {loading ? 'Actualizando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-gray-100 dark:border-white/5 pt-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
