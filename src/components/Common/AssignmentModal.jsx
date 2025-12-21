export default function AssignmentModal({ isOpen, onClose, taskName, contextData, onAssign }) {
    if (!isOpen) return null;

    const { members } = useDirectory();
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [customMessage, setCustomMessage] = useState("");

    // Pre-fill message with context (Reading text) if available
    useEffect(() => {
        if (contextData) {
            setCustomMessage(`Aquí tienes el texto para preparar:\n\n"${contextData.substring(0, 500)}..."\n\n(Revisa el leccionario completo)`);
        } else {
            setCustomMessage("");
        }
    }, [contextData]);

    const handleSend = () => {
        const member = members.find(m => m.id === selectedMemberId);
        if (!member || !member.phone) return;

        // Clean phone number
        const phone = member.phone.replace(/\D/g, '');

        // Construct message
        const text = `Hola ${member.fullName.split(' ')[0]}, se te ha asignado: *${taskName}*.\n\n${customMessage}`;
        const encodedText = encodeURIComponent(text);

        // Open WhatsApp
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');

        onAssign(selectedMemberId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Asignar Ministerio</h3>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tarea</label>
                    <div className="p-2 bg-gray-100 dark:bg-white/5 rounded text-gray-800 dark:text-white font-medium">
                        {taskName}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignar a</label>
                    <select
                        className="w-full p-2 border rounded dark:bg-black/20 dark:border-white/10"
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
                        className="w-full p-2 border rounded dark:bg-black/20 dark:border-white/10 text-sm h-32"
                        rows="5"
                        placeholder="Instrucciones especiales..."
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                    <button
                        onClick={handleSend}
                        disabled={!selectedMemberId}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                        Enviar WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
