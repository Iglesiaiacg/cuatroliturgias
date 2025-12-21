import { useState, useEffect } from 'react';
import AssignmentModal from '../Common/AssignmentModal';
import { useDirectory } from '../../context/DirectoryContext';
import { extractSection } from '../../utils/liturgyParser';

export default function RolesCard({ docContent }) {
    const { members } = useDirectory();

    // Define the standard slots for a Mass
    const SLOTS = [
        { id: 'moncion_entrada', label: 'Monición de Entrada', icon: 'campaign' },
        { id: 'primera_lectura', label: 'Primera Lectura', icon: 'menu_book' },
        { id: 'salmo', label: 'Salmo Responsorial', icon: 'music_note' },
        { id: 'segunda_lectura', label: 'Segunda Lectura', icon: 'menu_book' },
        { id: 'evangelio', label: 'Evangelio', icon: 'auto_stories' }, // Usually priest/deacon, but good to assign
        { id: 'oracion_fieles', label: 'Oración de los Fieles', icon: 'groups' },
        { id: 'colecta', label: 'Colecta/Ofrendas', icon: 'volunteer_activism' }
    ];

    const [assignments, setAssignments] = useState(() => {
        try {
            const stored = localStorage.getItem('liturgia_assignments');
            if (stored) return JSON.parse(stored);
        } catch (e) { console.error(e); }
        return {};
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);

    // Save on change
    useEffect(() => {
        localStorage.setItem('liturgia_assignments', JSON.stringify(assignments));
    }, [assignments]);

    const handleAssignClick = (slot) => {
        setActiveSlot(slot);
        setIsModalOpen(true);
    };

    const handleAssignmentComplete = (memberId) => {
        if (activeSlot && memberId) {
            setAssignments(prev => ({
                ...prev,
                [activeSlot.id]: memberId
            }));
        }
        setIsModalOpen(false);
    };

    const getMemberName = (id) => {
        const m = members.find(mem => mem.id === id);
        return m ? m.fullName : null;
    };

    return (
        <>
            <div className="neumorphic-card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                        <span className="material-symbols-outlined text-sm">assignment_ind</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Ministerios</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {SLOTS.map(slot => {
                        const assignedId = assignments[slot.id];
                        const assignedName = getMemberName(assignedId);

                        return (
                            <div
                                key={slot.id}
                                onClick={() => handleAssignClick(slot)}
                                className="flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer group transition-all neumorphic-card hover:scale-[1.02] active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${assignedId ? 'bg-primary/10 text-primary' : 'bg-stone-100 dark:bg-white/10 text-stone-400'}`}>
                                        <span className="material-symbols-outlined text-sm">{slot.icon}</span>
                                    </span>
                                    <div>
                                        <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest leading-none mb-1">{slot.label}</div>
                                        <div className={`text-sm font-medium ${assignedName ? 'text-stone-900 dark:text-stone-50' : 'text-stone-400 italic opacity-70'}`}>
                                            {assignedName || "Sin asignar"}
                                        </div>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">edit</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskName={activeSlot?.label || ''}
                contextData={activeSlot ? extractSection(docContent, activeSlot.id) : null}
                onAssign={handleAssignmentComplete}
            />
        </>
    );
}
