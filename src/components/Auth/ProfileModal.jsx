import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfileModal({ isOpen, onClose }) {
    const { currentUser, userRole, logout } = useAuth();

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

            if (!message && displayName === currentUser.displayName && !newPassword) {
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

            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-primary/5 p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        Mi Perfil
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.email}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rol: {userRole}</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nombre para Mostrar</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-2 text-sm"
                                placeholder="Ej: Padre Juan"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nueva Contraseña (Opcional)</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-2 text-sm"
                                placeholder="Dejar en blanco para no cambiar"
                            />
                        </div>

                        {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded">{error}</p>}
                        {message && <p className="text-xs text-green-600 font-bold bg-green-50 p-2 rounded">{message}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
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
