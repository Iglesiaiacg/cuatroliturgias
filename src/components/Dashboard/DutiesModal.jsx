import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const DUTIES = {
    treasurer: {
        title: "Tesorero Parroquial",
        tasks: [
            "Contabilizar y registrar la colecta dominical inmediatamente después de la misa.",
            "Resguardar los recibos de todos los gastos efectuados.",
            "Mantener actualizado el libro de cuentas en la plataforma.",
            "Gestionar los pagos recurrentes (luz, agua, estipendios)."
        ],
        icon: "savings"
    },
    sacristan: {
        title: "Sacristán Mayor",
        tasks: [
            "Llegar 45 min antes para preparar los vasos sagrados y ornamentos.",
            "Verificar existencias de vino, formas y aceite semanalmente.",
            "Mantener el orden y limpieza de la sacristía.",
            "Asegurar que el leccionario esté marcado en las lecturas correctas."
        ],
        icon: "church"
    },
    secretary: {
        title: "Secretaría Parroquial",
        tasks: [
            "Actualizar la base de datos de feligreses con nuevos miembros.",
            "Recopilar y transcribir las intenciones de misa.",
            "Gestionar la agenda del Párroco y citas pastorales.",
            "Expedir constancias y certificados solicitados."
        ],
        icon: "desk"
    },
    musician: {
        title: "Ministerio de Música",
        tasks: [
            "Seleccionar cantos litúrgicos acordes al tiempo y lecturas.",
            "Llegar al ensayo programado y 30 min antes de la misa.",
            "Cuidar el equipo de sonido y micrófonos.",
            "Mantener el silencio reverente en el área del coro."
        ],
        icon: "music_note"
    },
    acolyte: {
        title: "Cuerpo de Acólitos",
        tasks: [
            "Revestirse con alba y cíngulo 15 min antes de iniciar.",
            "Servir en el altar con dignidad y atención.",
            "Encender y apagar las velas del altar en el momento oportuno.",
            "Participar en las procesiones de entrada y salida."
        ],
        icon: "candle"
    }
};

import { createPortal } from 'react-dom';

export default function DutiesModal({ role, isOpen, onClose }) {
    if (!isOpen || !DUTIES[role]) return null;

    const { title, tasks, icon } = DUTIES[role];
    const { startPrivateChat } = useChat();
    const [priest, setPriest] = useState(null);

    // Find the Priest (Admin) to contact
    useEffect(() => {
        const fetchPriest = async () => {
            // Simple logic: Find the first user with 'admin' role
            // In a larger system, we might look for a specific 'priest' flag or ID
            const q = query(collection(db, 'users'), where('role', '==', 'admin'), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const doc = snap.docs[0];
                setPriest({ id: doc.id, ...doc.data() });
            }
        };
        fetchPriest();
    }, []);

    const handleContact = () => {
        if (priest) {
            startPrivateChat(priest);
            onClose(); // Close modal when chat opens
        } else {
            alert("No se encontró al sacerdote en el sistema. Por favor contacta por medio externo.");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-6 text-white text-center relative shrink-0">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                        <span className="material-symbols-outlined text-4xl">{icon}</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold">{title}</h2>
                    <p className="text-amber-100 text-sm opacity-90">Tus Deberes Ministeriales</p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Responsabilidades Clave</h3>
                        <ul className="space-y-3">
                            {tasks.map((task, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-green-600 text-lg shrink-0 mt-0.5">check_circle</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{task}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-amber-600">assignment_late</span>
                            <div>
                                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Informe Mensual</h4>
                                <p className="text-xs text-amber-900/70 dark:text-amber-300/70 mt-1">
                                    Recuerda que debes enviar tu informe de actividades al Párroco el <strong>último día de cada mes</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Entendido, ir a mi Módulo
                        </button>
                        <button
                            onClick={handleContact}
                            disabled={!priest}
                            className="px-6 py-3 bg-stone-800 dark:bg-stone-700 text-white rounded-xl font-bold text-sm hover:bg-black dark:hover:bg-stone-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            <span>Escribir al Pr. Rector</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
