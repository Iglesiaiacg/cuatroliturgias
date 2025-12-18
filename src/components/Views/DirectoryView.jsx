import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DirectoryView() {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Initial load
    useEffect(() => {
        const stored = localStorage.getItem('liturgia_directory');
        if (stored) {
            setMembers(JSON.parse(stored));
        }
    }, []);

    const saveMembers = (newList) => {
        setMembers(newList);
        localStorage.setItem('liturgia_directory', JSON.stringify(newList));
    };

    const handleCreate = () => {
        const newMember = {
            id: crypto.randomUUID(),
            fullName: '',
            address: '',
            birthDate: '',
            phone: '',
            email: '',
            social: '',
            civilStatus: 'soltero',
            spouse: '',
            children: '',
            bloodType: '',
            allergies: '',
            illnesses: '',
            medications: '',
            emergencyName: '',
            emergencyPhone: '',
            notes: '',
            isNew: true
        };
        setSelectedMember(newMember);
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!selectedMember.fullName) return;

        let newList;
        if (selectedMember.isNew) {
            const { isNew, ...memberData } = selectedMember;
            newList = [...members, memberData];
        } else {
            newList = members.map(m => m.id === selectedMember.id ? selectedMember : m);
        }

        saveMembers(newList);

        // Refresh selected member from list to ensure sync without isNew flag
        const savedId = selectedMember.id;
        const savedMember = newList.find(m => m.id === savedId);
        setSelectedMember(savedMember);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        const newList = members.filter(m => m.id !== selectedMember.id);
        saveMembers(newList);
        setSelectedMember(null);
        setIsEditing(false);
    };

    const filteredMembers = members.filter(m =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm))
    );

    return (
        <div className="flex bg-gray-50 dark:bg-black/20 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/5 h-[calc(100vh-140px)] animate-fade-in">
            {/* Sidebar List */}
            <div className="w-1/3 min-w-[300px] border-r border-gray-200 dark:border-white/10 flex flex-col bg-white dark:bg-surface-dark">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">groups</span>
                            Fieles
                            <span className="bg-gray-100 dark:bg-white/10 text-gray-500 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
                        </h2>
                        <button
                            onClick={handleCreate}
                            className="bg-primary hover:bg-red-700 text-white p-2 rounded-lg transition-colors shadow-sm"
                            title="Nuevo Fiel"
                        >
                            <span className="material-symbols-outlined text-xl">add_circle</span>
                        </button>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-black/20 pl-9 pr-4 py-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredMembers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">person_off</span>
                            <p className="text-sm">No se encontraron fieles</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => { setSelectedMember(member); setIsEditing(false); }}
                                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedMember?.id === member.id ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                                        {member.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className={`font-bold truncate ${selectedMember?.id === member.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {member.fullName}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate icon-text">
                                            {member.phone || 'Sin teléfono'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content / Form */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/5 p-4 md:p-8">
                {selectedMember ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-display font-bold shadow-sm">
                                    {selectedMember.fullName ? selectedMember.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedMember.fullName || 'Nuevo Registro'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedMember.id ? 'ID: ' + selectedMember.id.slice(0, 8) : 'Borrador'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            ELIMINAR
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            EDITAR
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => selectedMember.isNew ? setSelectedMember(null) : setIsEditing(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            CANCELAR
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!selectedMember.fullName}
                                            className="px-6 py-2 bg-primary text-white hover:bg-red-700 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-sm">save</span>
                                            GUARDAR
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            {/* Section 1: Personal */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">person</span> Datos Personales
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Nombre Completo" value={selectedMember.fullName} onChange={v => setSelectedMember({ ...selectedMember, fullName: v })} editing={isEditing} placeholder="Ej. Juan Pérez" focus />
                                    <Field label="Fecha de Nacimiento" type="date" value={selectedMember.birthDate} onChange={v => setSelectedMember({ ...selectedMember, birthDate: v })} editing={isEditing} />
                                    <Field label="Estado Civil" type="select" options={['Soltero/a', 'Casado/a', 'Viudo/a', 'Divorciado/a', 'Unión Libre']} value={selectedMember.civilStatus} onChange={v => setSelectedMember({ ...selectedMember, civilStatus: v })} editing={isEditing} />
                                    <Field label="Domicilio" value={selectedMember.address} onChange={v => setSelectedMember({ ...selectedMember, address: v })} editing={isEditing} placeholder="Calle, Número, Colonia" />
                                </div>
                            </div>

                            {/* Section 2: Contact */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">contact_phone</span> Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Teléfono / Celular" value={selectedMember.phone} onChange={v => setSelectedMember({ ...selectedMember, phone: v })} editing={isEditing} placeholder="555-123-4567" />
                                    <Field label="Email" type="email" value={selectedMember.email} onChange={v => setSelectedMember({ ...selectedMember, email: v })} editing={isEditing} placeholder="correo@ejemplo.com" />
                                    <Field label="Redes Sociales" value={selectedMember.social} onChange={v => setSelectedMember({ ...selectedMember, social: v })} editing={isEditing} placeholder="Facebook, Instagram..." colSpan={2} />
                                </div>
                            </div>

                            {/* Section 3: Medical (Vital) */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">medical_services</span> Salud (Vital)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Field label="Tipo de Sangre" value={selectedMember.bloodType} onChange={v => setSelectedMember({ ...selectedMember, bloodType: v })} editing={isEditing} placeholder="O+" />
                                    <Field label="Alergias" value={selectedMember.allergies} onChange={v => setSelectedMember({ ...selectedMember, allergies: v })} editing={isEditing} placeholder="Penicilina, Nueces..." colSpan={2} />
                                    <Field label="Enfermedades Crónicas" value={selectedMember.illnesses} onChange={v => setSelectedMember({ ...selectedMember, illnesses: v })} editing={isEditing} placeholder="Diabetes, Hipertensión..." colSpan={3} />
                                </div>
                            </div>

                            {/* Section 4: Family */}
                            <div className="p-6 bg-gray-50/30 dark:bg-white/5">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">diversity_3</span> Familia
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <Field label="Cónyuge" value={selectedMember.spouse} onChange={v => setSelectedMember({ ...selectedMember, spouse: v })} editing={isEditing} placeholder="Nombre del esposo/a" />
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hijos</label>
                                        {isEditing ? (
                                            <textarea
                                                value={selectedMember.children}
                                                onChange={e => setSelectedMember({ ...selectedMember, children: e.target.value })}
                                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                                                placeholder="Lista de hijos y edades..."
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[1.5rem]">{selectedMember.children || '—'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <span className="material-symbols-outlined text-6xl mb-4">badge</span>
                        <p className="text-xl font-medium">Selecciona un fiel para ver detalles</p>
                        <p className="text-sm">O crea uno nuevo con el botón +</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ label, value, onChange, editing, type = "text", placeholder, options, colSpan = 1, focus }) {
    return (
        <div className={colSpan > 1 ? `col-span-${colSpan} md:col-span-${colSpan}` : ''}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">{label}</label>
            {editing ? (
                type === 'select' ? (
                    <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300"
                        placeholder={placeholder}
                        autoFocus={focus}
                    />
                )
            ) : (
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 min-h-[1.25rem] border-b border-transparent">
                    {value || <span className="text-gray-300 italic text-xs">Sin información</span>}
                </div>
            )}
        </div>
    );
}
