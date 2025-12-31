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

        // Prepare: Fetch availabilities for all members relevant to the month
        const memberAvailabilities = {};

        for (const member of members) {
            const userAvailRef = doc(db, `users/${member.id}/availability/calendar`);
            const snap = await getDoc(userAvailRef);
            if (snap.exists()) {
                memberAvailabilities[member.id] = snap.data().dates || {};
            }
        }

        // Round-robin counters
        const roleCounters = {};
        roles.forEach(r => roleCounters[r.id] = 0);

        sundays.forEach(sunday => {
            const dateKey = sunday.toISOString().split('T')[0];
            if (newRoster[dateKey]) return; // Skip currently filled days to avoid overwriting manual work? Or maybe just empty ones. 
            // Let's only fill empty slots.

            const dayAssignments = {};

            roles.forEach(role => {
                // Filter eligible members (simulated: anyone can be 'usher', others need specific role check)
                // In a real app, `member.roles` array.
                // Here we'll randomly pick from active members who are NOT unavailable.

                const eligible = members.filter(m => {
                    // Check availability
                    // The AvailabilityCalendar stores keys as YYYY-MM-DD
                    if (memberAvailabilities[m.id]?.[dateKey]) return false; // User marked this date as unavailable

                    // Role check
                    if (role.id === 'presider') return m.roles?.includes('presbyter') || m.role === 'admin' || m.role === 'presbyter';
                    if (role.id === 'preacher') return m.roles?.includes('preacher') || m.roles?.includes('presbyter') || m.role === 'admin' || m.role === 'presbyter';
                    if (role.id === 'acolyte') return m.roles?.includes('acolyte') || m.role === 'acolyte' || m.role === 'admin' || m.role === 'sacristan';
                    if (role.id === 'lector') return m.roles?.includes('lector') || m.role === 'lector' || m.role === 'admin' || m.role === 'presbyter';
                    if (role.id === 'musician') return m.roles?.includes('musician') || m.role === 'musician' || m.role === 'admin';
                    if (role.id === 'usher') return true; // Anyone can be an usher
                    return true;
                });

                if (eligible.length > 0) {
                    // Basic rotation logic could go here. Random for now.
                    const picked = eligible[Math.floor(Math.random() * eligible.length)];
                    dayAssignments[role.id] = picked.id;
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
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {sundays.map(sunday => {
                    const dateKey = sunday.toISOString().split('T')[0];
                    const assignments = rosterData[dateKey] || {};

                    return (
                        <tr key={dateKey} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-gray-900 dark:text-gray-200 sticky left-0 bg-white dark:bg-[#1a1a1a] z-10 shadow-r">
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
        </table >
            </div >

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
            )
}
        </div >
    );
}
