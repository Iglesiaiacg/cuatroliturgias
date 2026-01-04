import { createPortal } from 'react-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

export default function AssignmentPopup({ assignment, onClose }) {
    const { currentUser } = useAuth();

    const handleAccept = async () => {
        if (!currentUser || !assignment) return;
        try {
            const assignRef = doc(db, 'users', currentUser.uid, 'assignments', assignment.id);
            await updateDoc(assignRef, {
                status: 'accepted',
                viewedAt: serverTimestamp()
            });
            onClose();
        } catch (e) {
            console.error("Error accepting assignment:", e);
        }
    };

    if (!assignment) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-stone-800 animate-scale-in relative">

                {/* Decorative Header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary/50 to-primary rounded-t-2xl"></div>

                <div className="p-6 md:p-8 flex flex-col items-center text-center border-b border-gray-100 dark:border-stone-800">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
                        Tienes una Asignación
                    </h2>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                        {assignment.title}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-stone-800/30">
                    <div className="prose dark:prose-invert max-w-none text-left">
                        <p className="text-sm text-gray-400 font-bold mb-2">Para ensayar:</p>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-gray-200 dark:border-stone-700 shadow-sm font-serif text-lg leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                            {assignment.content.replace(/^"|"$/g, '') /* Remove surrounding quotes if present */}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-stone-800 flex justify-center bg-white dark:bg-stone-900 rounded-b-2xl">
                    <button
                        onClick={handleAccept}
                        className="btn-primary w-full md:w-auto px-12 py-3 text-lg shadow-xl shadow-primary/20"
                    >
                        Entendido, voy a ensayar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
