import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useDirectory } from '../../context/DirectoryContext';
import { useAuth } from '../../context/AuthContext'; // Import Auth

export default function MinistersOnDutyCard({ date }) {
    const { userRole } = useAuth(); // Get Role
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { members } = useDirectory();

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                // Roster is stored by Month: "YYYY-MM"
                const rosterId = format(date, 'yyyy-MM');
                const dayKey = format(date, 'yyyy-MM-dd'); // Key inside the document

                const rosterRef = doc(db, 'rosters', rosterId);
                const snap = await getDoc(rosterRef);

                if (snap.exists()) {
                    const data = snap.data();
                    const monthAssignments = data.assignments || {};
                    const todayAssignments = monthAssignments[dayKey] || {};

                    // Parse assignments: { roleId: userId } -> Array of objects
                    const parsed = Object.entries(todayAssignments).map(([roleId, userId]) => {
                        const member = members.find(m => m.id === userId);
                        return {
                            id: `${dayKey}-${roleId}`,
                            role: roleId,
                            userId: userId,
                            userName: member ? (member.displayName || member.fullName || member.email) : 'Usuario desconocido',
                            userAvatar: member?.photoURL || null
                        };
                    });
                    setAssignments(parsed);
                } else {
                    setAssignments([]);
                }
            } catch (error) {
                console.error("Error fetching roster:", error);
            } finally {
                setLoading(false);
            }
        };

        if (members.length > 0) {
            fetchAssignments();
        }
    }, [date, members]);

    const getRoleName = (roleId) => {
        const map = {
            'presider': ' Preside',
            'preacher': 'Predica',
            'lector': 'Lector',
            'acolyte': 'Acólito',
            'musician': 'Música',
            'usher': 'Ujier',
            'sacristan': 'Sacristán'
        };
        return map[roleId] || roleId;
    };

    return (
        <div className="neumorphic-card p-6 border-l-4 border-indigo-500 bg-white dark:bg-stone-900">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">group</span>
                    Ministros de Hoy
                </h3>
                {/* Only Admin can see the Manage button */}
                {userRole === 'admin' && (
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        GESTIONAR
                    </button>
                )}
            </div>

            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                    <p className="text-sm text-gray-500 italic">Sin asignaciones confirmadas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map((assign) => (
                        <div key={assign.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                                    {assign.userAvatar ? (
                                        <img src={assign.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        getRoleName(assign.role).charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{assign.userName}</p>
                                    <p className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">{getRoleName(assign.role)}</p>
                                </div>
                            </div>
                            {/* Status Icon */}
                            <span className="material-symbols-outlined text-green-500 text-sm" title="Confirmado">check_circle</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
