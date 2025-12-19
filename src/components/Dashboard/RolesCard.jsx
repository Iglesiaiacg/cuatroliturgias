import { useState, useEffect } from 'react';

export default function RolesCard() {
    const [roles, setRoles] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Load roles from storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('liturgia_roles');
            if (stored) {
                setRoles(JSON.parse(stored));
            } else {
                // Default empty roles
                setRoles({
                    lector: '',
                    acolito: '',
                    bienvenida: ''
                });
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('liturgia_roles', JSON.stringify(roles));
        setIsEditing(false);
    };

    const handleChange = (role, value) => {
        setRoles(prev => ({ ...prev, [role]: value }));
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Servidores</span>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="text-xs font-bold text-primary hover:text-red-700 transition-colors"
                >
                    {isEditing ? 'GUARDAR' : 'EDITAR'}
                </button>
            </div>

            <div className="space-y-3">
                {/* Lector */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-[30%]">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">mic</span>
                        </span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Lector</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={roles.lector || ''}
                            onChange={(e) => handleChange('lector', e.target.value)}
                            className="flex-1 text-right text-xs border-b border-gray-200 focus:border-primary outline-none py-1 bg-transparent"
                            placeholder="Nombre..."
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {roles.lector || <span className="text-gray-300 italic">Sin asignar</span>}
                        </span>
                    )}
                </div>

                {/* Acolito */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-[30%]">
                        <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">candle</span>
                        </span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Acólito</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={roles.acolito || ''}
                            onChange={(e) => handleChange('acolito', e.target.value)}
                            className="flex-1 text-right text-xs border-b border-gray-200 focus:border-primary outline-none py-1 bg-transparent"
                            placeholder="Nombre..."
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {roles.acolito || <span className="text-gray-300 italic">Sin asignar</span>}
                        </span>
                    )}
                </div>

                {/* Bienvenida/Limpieza */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-[30%]">
                        <span className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">volunteer_activism</span>
                        </span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bienvenida</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={roles.bienvenida || ''}
                            onChange={(e) => handleChange('bienvenida', e.target.value)}
                            className="flex-1 text-right text-xs border-b border-gray-200 focus:border-primary outline-none py-1 bg-transparent"
                            placeholder="Nombre..."
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {roles.bienvenida || <span className="text-gray-300 italic">Sin asignar</span>}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
