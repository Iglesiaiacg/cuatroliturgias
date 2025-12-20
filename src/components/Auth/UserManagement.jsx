import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement() {
    const { currentUser, userRole, assignRole } = useAuth();

    // Form state
    const [uid, setUid] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('sacristan');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const roles = [
        { id: 'admin', label: 'Sacerdote (Admin)' },
        { id: 'sacristan', label: 'Sacristán (Sacristía)' },
        { id: 'secretary', label: 'Secretaría (Admin sin Liturgia)' },
        { id: 'reader', label: 'Lector/Músico (Solo Lectura)' },
    ];

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: In a real app we'd create the user here via a Cloud Function.
            // Since we can't do that easily client-side without logging out,
            // we assume the user is manually created in Firebase Console first, 
            // and we just link the Role here using the UID.
            await assignRole(uid, role, name);
            setMessage(`Rol asignado correctamente a ${name}`);
            setUid('');
            setName('');
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
        setLoading(false);
    };

    if (userRole !== 'admin') {
        return <div className="p-4 text-red-500">Acceso Denegado. Solo el Párroco puede ver esto.</div>;
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Gestión de Usuarios</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-sm text-blue-800 dark:text-blue-200">
                <strong>Instrucciones:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1 text-xs">
                    <li>Ve a la consola de Firebase y crea el usuario en "Authentication".</li>
                    <li>Copia el <strong>UID</strong> del usuario creado.</li>
                    <li>Pégalo aquí para asignarle su Nombre y Rol en el sistema.</li>
                </ol>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">UID de Firebase</label>
                        <input
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            placeholder="Ej: abc123xyz..."
                            required
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre para Mostrar</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Hna. María"
                            required
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Rol Asignado</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {roles.map(r => (
                            <label key={r.id} className={`
                                border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2
                                ${role === r.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10'}
                            `}>
                                <input
                                    type="radio"
                                    name="role"
                                    value={r.id}
                                    checked={role === r.id}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="accent-primary"
                                />
                                <span className="text-sm font-medium">{r.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {message && (
                    <p className={`text-sm font-bold ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-2 rounded-lg shadow-sm hover:bg-red-800 transition-colors"
                >
                    {loading ? 'Guardando...' : 'Asignar Rol'}
                </button>
            </form>
        </div>
    );
}
