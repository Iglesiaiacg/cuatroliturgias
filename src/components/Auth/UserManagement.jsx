import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function UserManagement() {
    const { currentUser, userRole, assignRole } = useAuth();

    // User List State
    const [users, setUsers] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // Form state
    const [uid, setUid] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('sacristan');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const roles = [
        { id: 'admin', label: 'Sacerdote (Admin)' },
        { id: 'sacristan', label: 'Sacristán (Sacristía)' },
        { id: 'secretary', label: 'Secretaría (Admin sin Liturgia)' },
        { id: 'reader', label: 'Lector/Músico (Solo Lectura)' },
    ];

    // Fetch users on mount
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setLoadingList(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await assignRole(uid, role, name);
            setMessage(`Rol ${isEditing ? 'actualizado' : 'asignado'} correctamente a ${name}`);
            resetForm();
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
        setLoading(false);
    };

    const handleEdit = (user) => {
        setUid(user.id);
        setName(user.displayName || '');
        setRole(user.role || 'sacristan');
        setIsEditing(true);
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setUid('');
        setName('');
        setRole('sacristan');
        setIsEditing(false);
    };

    const getRoleLabel = (roleId) => {
        const r = roles.find(r => r.id === roleId);
        return r ? r.label : roleId;
    };

    if (userRole !== 'admin') {
        return <div className="p-4 text-red-500">Acceso Denegado. Solo el Párroco puede ver esto.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Form Section */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Editar Usuario' : 'Asignar Nuevo Rol'}
                    </h2>
                    {isEditing && (
                        <button
                            onClick={resetForm}
                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white underline"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>

                {!isEditing && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-sm text-blue-800 dark:text-blue-200">
                        <strong>Para nuevos usuarios:</strong>
                        <ol className="list-decimal ml-4 mt-2 space-y-1 text-xs">
                            <li>Ve a la consola de Firebase y crea el usuario en "Authentication".</li>
                            <li>Copia el <strong>UID</strong> y pégalo abajo.</li>
                        </ol>
                    </div>
                )}

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
                                disabled={isEditing} // UID cannot be changed, only role/name
                                className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm disabled:opacity-50"
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
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Asignar Rol')}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usuarios Activos</h3>
                </div>

                {loadingList ? (
                    <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No hay usuarios con roles asignados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Rol</th>
                                    <th className="px-6 py-3 font-mono">UID</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                            {user.displayName || 'Sin Nombre'}
                                            {user.id === currentUser.uid && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] uppercase">Tú</span>}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                                            {getRoleLabel(user.role)}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-gray-400 truncate max-w-[150px]" title={user.id}>
                                            {user.id}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-primary hover:text-red-800 font-bold text-xs uppercase"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
