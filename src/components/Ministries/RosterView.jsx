import { useState, useEffect } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { generateRosterPDF } from '../../utils/rosterPDFGenerator';

export default function RosterView() {
    const { members } = useDirectory(); // All users
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [rosterData, setRosterData] = useState({}); // { "2024-02-04": { "lector": "uid1", "acolyte": "uid2" } }
    const [loading, setLoading] = useState(false);
    const [availabilities, setAvailabilities] = useState({}); // { "uid": { "2024-02-04": true/false } }

    const roles = [
        { id: 'presider', label: 'Preside' },
        { id: 'preacher', label: 'Predica' },
        { id: 'lector', label: 'Lector' },
        { id: 'acolyte', label: 'Acólito' },
        { id: 'musician', label: 'Música' },
        { id: 'usher', label: 'Ujier' }
    ];

    // Helper: Get all Sundays in the selected month
    const getSundays = (date) => {
        const sundays = [];
        const year = date.getFullYear();
        const month = date.getMonth();
        const d = new Date(year, month, 1);

        while (d.getDay() !== 0) {
            d.setDate(d.getDate() + 1);
        }

        while (d.getMonth() === month) {
            sundays.push(new Date(d));
            d.setDate(d.getDate() + 7);
        }
        return sundays;
    };

    const sundays = getSundays(currentMonth);

    // Fetch existing roster and availabilities
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const rosterId = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

            // 1. Fetch Roster
            try {
                const rosterSnap = await getDoc(doc(db, 'rosters', rosterId));
                if (rosterSnap.exists()) {
                    setRosterData(rosterSnap.data().assignments || {});
                } else {
                    setRosterData({});
                }
            } catch (e) {
                console.error("Error fetching roster", e);
            }

            // 2. Fetch Availabilities for ALL members
            // NOTE: In a real large app, this should be optimized.
            // Here we iterate members and fetch their availability subcollection (or a centralized collection)
            // For now, let's assume we can fetch a summary or query for "unavailable" dates.
            // *Optimization for MVP*: Just assume we don't have this data heavily populated yet, 
            // or fetch it on demand.  Let's skip pre-fetching all availabilities for the UI to keep it snappy
            // and only fetch when "Auto-generating".

            setLoading(false);
        };

        fetchData();
    }, [currentMonth, members]);


    const handleAutoGenerate = async () => {
        setLoading(true);
        const newRoster = { ...rosterData };

        // 1. Fetch Previous Month for History Context (Avoid burning out same people)
        const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const prevRosterId = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        let historyUsage = {}; // { uid: count }

        try {
            const prevSnap = await getDoc(doc(db, 'rosters', prevRosterId));
            if (prevSnap.exists()) {
                const prevData = prevSnap.data().assignments || {};
                Object.values(prevData).forEach(day => {
                    Object.values(day).forEach(uid => {
                        if (uid) historyUsage[uid] = (historyUsage[uid] || 0) + 1;
                    });
                });
            }
        } catch (e) {
            console.warn("Could not fetch previous history, starting fresh.", e);
        }

        // 2. Prepare Availabilities
        const memberAvailabilities = {};
        for (const member of members) {
            const userAvailRef = doc(db, `users/${member.id}/availability/calendar`);
            const snap = await getDoc(userAvailRef);
            if (snap.exists()) {
                memberAvailabilities[member.id] = snap.data().dates || {};
            }
        }

        // 3. Helper to get Score (Lower is better)
        const getUsageScore = (uid) => {
            let currentMonthCount = 0;
            Object.values(newRoster).forEach(day => {
                Object.values(day).forEach(assignedUid => {
                    if (assignedUid === uid) currentMonthCount++;
                });
            });
            // Total Score = Current Month Assignments + (Previous Month / 2)
            // Weighting current month more heavily to balance *now*, but using history as tie-breaker.
            return currentMonthCount + ((historyUsage[uid] || 0) * 0.5);
        };

        // 4. Round-Robin / Load Balanced Assignment
        sundays.forEach(sunday => {
            const dateKey = sunday.toISOString().split('T')[0];
            const dayAssignments = { ...(newRoster[dateKey] || {}) }; // Preserve existing manual edits

            roles.forEach(role => {
                // Skip if manually assigned already
                if (dayAssignments[role.id]) return;

                const eligible = members.filter(m => {
                    // Availability Check
                    if (memberAvailabilities[m.id]?.[dateKey]) return false;

                    // Role Check (Simplified for boilerplate)
                    const roleList = m.roles || [m.role];
                    if (role.id === 'presider') return roleList.includes('presbyter') || roleList.includes('admin');
                    if (role.id === 'preacher') return roleList.includes('presbyter') || roleList.includes('preacher') || roleList.includes('admin');
                    if (role.id === 'acolyte') return roleList.includes('acolyte') || roleList.includes('admin') || roleList.includes('sacristan');
                    if (role.id === 'lector') return roleList.includes('lector') || roleList.includes('admin') || roleList.includes('presbyter');
                    if (role.id === 'musician') return roleList.includes('musician') || roleList.includes('admin');
                    if (role.id === 'usher') return true;
                    return true;
                });

                if (eligible.length > 0) {
                    // SORT BY SCORE (ASC) -> Least used first
                    eligible.sort((a, b) => {
                        const scoreA = getUsageScore(a.id);
                        const scoreB = getUsageScore(b.id);
                        return scoreA - scoreB;
                    });

                    // TIE BREAKING: Get all candidates with the same lowest score
                    const lowestScore = getUsageScore(eligible[0].id);
                    const bestCandidates = eligible.filter(m => getUsageScore(m.id) === lowestScore);

                    // Randomly pick from best candidates to avoid deterministic same-order
                    const picked = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

                    if (picked) {
                        dayAssignments[role.id] = picked.id;
                    }
                }
            });

            newRoster[dateKey] = dayAssignments;
        });

        setRosterData(newRoster);
        setLoading(false);
    };

    const handleSave = async () => {
        const rosterId = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        try {
            await setDoc(doc(db, 'rosters', rosterId), {
                month: rosterId,
                assignments: rosterData,
                updatedAt: new Date()
            }, { merge: true });
            alert("Roster guardado correctamente.");
        } catch (e) {
            console.error(e);
            alert("Error al guardar.");
        }
    };

    const handleChangeAssignment = (dateKey, roleId, userId) => {
        setRosterData(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                [roleId]: userId
            }
        }));
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newDate);
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto pb-32">
            <div className="flex flex-col gap-6 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
                        Gestión de Roles
                    </h1>
                    <p className="text-gray-500 text-sm">Asigna ministros para los servicios dominicales.</p>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <th className="p-4 text-left font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-[#1a1a1a] z-10 w-32 border-r border-gray-100 dark:border-white/5 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                    Fecha
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="p-4 text-left font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">
                                        {role.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {sundays.map(sunday => {
                                const dateKey = sunday.toISOString().split('T')[0];
                                const assignments = rosterData[dateKey] || {};

                                return (
                                    <tr key={dateKey} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-gray-900 dark:text-gray-200 sticky left-0 bg-white dark:bg-[#1a1a1a] z-10 border-r border-gray-100 dark:border-white/5 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                            <div className="flex flex-col">
                                                <span className="text-lg">{sunday.getDate()}</span>
                                                <span className="text-xs text-gray-400 uppercase">{monthNames[sunday.getMonth()].substring(0, 3)}</span>
                                            </div>
                                        </td>
                                        {roles.map(role => (
                                            <td key={role.id} className="p-2">
                                                <select
                                                    value={assignments[role.id] || ''}
                                                    onChange={(e) => handleChangeAssignment(dateKey, role.id, e.target.value)}
                                                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary truncate"
                                                >
                                                    <option value="" className="text-gray-400">-- Asignar --</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.fullName || m.email}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            const text = `*Rol de Ministerios - ${monthNames[currentMonth.getMonth()]}*\n\n` +
                                sundays.map(sunday => {
                                    const dateKey = sunday.toISOString().split('T')[0];
                                    const assign = rosterData[dateKey] || {};
                                    return `*${sunday.getDate()} ${monthNames[sunday.getMonth()]}*\n` +
                                        roles.map(r => {
                                            const uid = assign[r.id];
                                            const member = members.find(m => m.id === uid);
                                            return member ? `- ${r.label}: ${member.displayName || member.fullName}` : null;
                                        }).filter(Boolean).join('\n');
                                }).join('\n\n');

                            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                            window.open(url, '_blank');
                        }}
                        className="text-green-600 hover:text-green-700 font-bold text-sm flex items-center gap-2 mt-2"
                    >
                        <span className="material-symbols-outlined">share</span> Compartir por WhatsApp
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined">info</span>
                            Cómo funciona
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                            1. Selecciona el mes a planificar.<br />
                            2. Pulsa <b>Auto-Completar</b> para llenar huecos vacíos respetando las "No Disponibilidades".<br />
                            3. Ajusta manualmente si es necesario.<br />
                            4. Pulsa <b>Guardar</b> para publicar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
