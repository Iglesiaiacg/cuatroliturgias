import { useState, useEffect } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createPortal } from 'react-dom';

export default function AssignmentModal({ isOpen, onClose, taskName, contextData, onAssign }) {
    const { currentUser } = useAuth();

    const { members } = useDirectory();
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [customMessage, setCustomMessage] = useState("");

    // Pre-fill message with context (Reading text) if available
    useEffect(() => {
        if (contextData) {
            setCustomMessage(`Aquí tienes el texto para preparar:\n\n"${contextData}"\n\n(Revisa el leccionario completo)`);
        } else {
            setCustomMessage("");
        }
    }, [contextData]);

    const handleSend = async () => {
        const member = members.find(m => m.id === selectedMemberId);
        if (!member) return;

        try {
            await addDoc(collection(db, 'users', selectedMemberId, 'assignments'), {
                title: taskName,
                content: customMessage || contextData || '',
                assignedBy: currentUser?.email || 'Admin',
                assignedAt: serverTimestamp(),
                status: 'pending', // 'pending' -> 'accepted'
                viewed: false
            });

            // alert("Asignación enviada al Dashboard del usuario."); // Optional feedback
            onAssign(selectedMemberId);
        } catch (e) {
            console.error("Error assigning task:", e);
            alert("Error al asignar: " + e.message);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="neumorphic-card p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Asignar Ministerio</h3>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tarea</label>
                    <div className="neumorphic-inset p-2 text-gray-800 font-medium">
                        {taskName}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignar a</label>
                    <select
                        className="w-full neumorphic-inset p-2 outline-none"
                        value={selectedMemberId}
                        onChange={e => setSelectedMemberId(e.target.value)}
                    >
                        <option value="">Seleccionar Fiel...</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.fullName} {m.phone ? '' : '(Sin Teléfono)'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Mensaje / Texto Litúrgico
                        {contextData && <span className="ml-2 text-[10px] text-green-600 bg-green-50 px-2 rounded-full">Automático</span>}
                    </label>
                    <textarea
                        className="w-full neumorphic-inset p-2 text-sm h-32 outline-none"
                        rows="5"
                        placeholder="Instrucciones especiales..."
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium">Cancelar</button>
                    <button
                        onClick={handleSend}
                        disabled={!selectedMemberId}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-bold shadow-md transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">assignment_ind</span>
                        Asignar al Dashboard
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
