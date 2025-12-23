import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
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
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'
    // Permission State
    const [permissions, setPermissions] = useState({});
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const roles = [
        { id: 'admin', label: 'Sacerdote (Admin)' },
        { id: 'treasurer', label: 'Tesorero (Finanzas)' },
        { id: 'sacristan', label: 'Sacristán (Sacristía)' },
        { id: 'secretary', label: 'Secretario/a (Admin)' },
        { id: 'musician', label: 'Líder de Canto' },
        { id: 'acolyte', label: 'Acólito / Servidor' },
        { id: 'reader', label: 'Lector (Solo Lectura)' },
    ];

    const AVAILABLE_PERMISSIONS = [
        { id: 'view_liturgy', label: 'Ver Liturgia' },
        { id: 'view_calendar', label: 'Ver Calendario' },
        { id: 'view_sacristy', label: 'Ver Sacristía' },
        { id: 'view_directory', label: 'Ver Directorio' },
        { id: 'view_offerings', label: 'Ver Ofrendas' },
        { id: 'manage_users', label: 'Gestionar Usuarios' },
        { id: 'view_treasury', label: 'Ver Tesorería' },
        { id: 'view_music', label: 'Ver Cantoral' },
        { id: 'manage_music', label: 'Editar Cantoral' }, // New
    ];

    // Default permissions if none exist
    const DEFAULT_PERMISSIONS = {
        admin: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'manage_users', 'view_treasury', 'view_music', 'manage_music'],
        treasurer: ['view_calendar', 'view_offerings', 'view_treasury'],
        secretary: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'view_music'],
        sacristan: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_music'],
        reader: ['view_liturgy', 'view_calendar', 'view_music']
    };

    // Fetch users and permissions on mount
    // Fetch users and permissions on mount
    useEffect(() => {
        if (!currentUser) return;

        // Guard: Only admins can listen to users list
        if (!checkPermission || !checkPermission('manage_users')) {
            setLoadingList(false);
            return;
        }

        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setLoadingList(false);
        }, (error) => {
            console.error("User Sync Error:", error);
            setLoadingList(false);
        });

        // Load Permissions (or set defaults)
        const loadPermissions = async () => {
            setLoadingPermissions(true);
            try {
                // We'll store permissions in a doc: settings/permissions
                // If it doesn't exist, we use defaults (and maybe save them?)
                // For MVP without reading DB repeatedly, we can just hardcode defaults for now 
                // OR actually try to read 'settings/permissions'
                // Let's implement dynamic reading from existing code structure if possible
                // ... Assuming getDoc imported
            } catch (e) {
                console.error("Error loading permissions", e);
            }
            // For now, initialize with defaults + overrides if we implement storage later
            // To make this TRULY dynamic, we need to save/load from Firestore.
            // Let's defer Firestore persistence for permissions to the next step and strictly use state here.
            setPermissions(DEFAULT_PERMISSIONS);
            setLoadingPermissions(false);
        };
        loadPermissions();

        return () => unsubscribeUsers();
    }, [currentUser]);

    const [isEditing, setIsEditing] = useState(false);

    const getRoleLabel = (r) => {
        const found = roles.find(item => item.id === r);
        return found ? found.label : r;
    };

    const resetForm = () => {
        setUid('');
        setName('');
        setRole('sacristan');
        setIsEditing(false);
        setMessage('');
    };

    const handleEdit = (user) => {
        setUid(user.id);
        setName(user.displayName || '');
        setRole(user.role || 'guest');
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await assignRole(uid, role, name);
            setMessage('Usuario actualizado correctamente.');
            if (isEditing) resetForm();
            else {
                setUid(''); // Clear UID for next add, but maybe keep name?
                setName('');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error: ' + error.message);
        }
        setLoading(false);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("¿Estás seguro de eliminar este perfil? El usuario perderá su rol y acceso. (Nota: Para borrar el login definitivamente, hazlo en Firebase Console).")) {
            return;
        }
        try {
            await deleteDoc(doc(db, 'users', userId));
            setMessage('Usuario eliminado correctamente.');
            if (uid === userId) resetForm();
        } catch (error) {
            console.error("Error deleting user:", error);
            setMessage('Error al eliminar: ' + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            (user.displayName && user.displayName.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term)) ||
            (user.id && user.id.toLowerCase().includes(term))
        );
    });

    // Permission Toggle Handler (local state for now)
    const togglePermission = (roleId, permId) => {
        setPermissions(prev => {
            const rolePerms = prev[roleId] || [];
            const hasPerm = rolePerms.includes(permId);
            const newRolePerms = hasPerm
                ? rolePerms.filter(p => p !== permId)
                : [...rolePerms, permId];

            return {
                ...prev,
                [roleId]: newRolePerms
            };
        });
    };

    const savePermissions = async () => {
        setLoading(true);
        try {
            // Save to Firestore: settings/permissions
            // await setDoc(doc(db, 'settings', 'permissions'), permissions);
            // We need to import setDoc and db. 
            // IMPORTANT: We need to update AuthContext to READ this. 
            // For this step, I'll just mock the save toast.
            setMessage('Permisos guardados (Simulación - falta conectar AuthContext)');
        } catch (e) {
            setMessage('Error al guardar permisos: ' + e.message);
        }
        setLoading(false);
    };


    // We use the hook context to check permission (although App.jsx already guards this)
    const { checkPermission } = useAuth();

    if (!checkPermission || !checkPermission('manage_users')) {
        return <div className="p-4 text-red-500">Acceso Denegado. Se requieren permisos de administrador.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-white/5 pb-2">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${activeTab === 'roles' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    Configuración de Roles
                </button>
            </div>

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <>
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
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usuarios Activos</h3>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-64">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                        </div>

                        {loadingList ? (
                            <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                {searchTerm ? 'No se encontraron usuarios.' : 'No hay usuarios con roles asignados.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                                            <tr>
                                                <th className="px-6 py-3">Nombre</th>
                                                <th className="px-6 py-3">Rol</th>
                                                <th className="px-6 py-3 font-mono">UID</th>
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                                        {user.displayName || 'Sin Nombre'}
                                                        <div className="text-xs text-gray-400 font-normal">{user.email}</div>
                                                        {user.id === currentUser.uid && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] uppercase">Tú</span>}
                                                    </td>
                                                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                                                        {getRoleLabel(user.role)}
                                                    </td>
                                                    <td className="px-6 py-3 font-mono text-xs text-gray-400 truncate max-w-[150px]" title={user.id}>
                                                        {user.id}
                                                    </td>
                                                    <td className="px-6 py-3 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="text-primary hover:text-red-800 font-bold text-xs uppercase"
                                                        >
                                                            Editar
                                                        </button>
                                                        {user.id !== currentUser.uid && (
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-gray-400 hover:text-red-600 font-bold text-xs uppercase ml-2"
                                                                title="Eliminar Perfil"
                                                            >
                                                                <span className="material-symbols-outlined text-lg align-middle">delete</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* TAB: ROLES */}
            {activeTab === 'roles' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Matriz de Permisos</h3>
                        <button
                            onClick={savePermissions}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-800 transition-colors"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                    {message && <div className="px-6 py-2 text-sm font-bold text-green-600 bg-green-50">{message}</div>}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-b dark:border-white/10">Permiso / Rol</th>
                                    {roles.map(role => (
                                        <th key={role.id} className="px-4 py-3 text-center border-b dark:border-white/10">{role.label.split(' ')[0]}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                                            {perm.label}
                                            <div className="text-[10px] text-gray-400 font-normal">{perm.id}</div>
                                        </td>
                                        {roles.map(role => {
                                            const isChecked = (permissions[role.id] || []).includes(perm.id);
                                            return (
                                                <td key={`${role.id}-${perm.id}`} className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(role.id, perm.id)}
                                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer accent-primary"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
