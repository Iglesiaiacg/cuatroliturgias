import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function AvailabilityCalendar() {
    const { currentUser } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState({}); // { "YYYY-MM-DD": true }
    const [loading, setLoading] = useState(true);

    // Fetch availability
    useEffect(() => {
        if (!currentUser) return;

        const year = currentDate.getFullYear();
        // We store availability in a single document per user for simplicity for now, 
        // or partitioned by year if it grows. Let's use a single doc 'availability' in user subcollection.
        const docRef = doc(db, `users/${currentUser.uid}/availability/calendar`);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setUnavailableDates(docSnap.data().dates || {});
            } else {
                setUnavailableDates({});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, currentDate]);

    const handleToggleDate = async (day) => {
        // Construct YYYY-MM-DD
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${year}-${month}-${dayStr}`;

        const newStatus = !unavailableDates[dateKey];

        // Optimistic update
        const newDates = { ...unavailableDates };
        if (newStatus) {
            newDates[dateKey] = true;
        } else {
            delete newDates[dateKey];
        }
        setUnavailableDates(newDates);

        try {
            const docRef = doc(db, `users/${currentUser.uid}/availability/calendar`);
            await setDoc(docRef, { dates: newDates }, { merge: true });
        } catch (error) {
            console.error("Error saving availability:", error);
            // Revert on error
            setUnavailableDates(unavailableDates);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="bg-white dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <p className="text-xs text-gray-400">Marca los días que NO podrás servir</p>
                </div>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty slots */}
                {[...Array(firstDayOfMonth)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days */}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const dateKey = `${currentDate.getFullYear()}-${month}-${dayStr}`;
                    const isUnavailable = unavailableDates[dateKey];
                    const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date().setHours(0, 0, 0, 0);

                    return (
                        <button
                            key={day}
                            onClick={() => !isPast && handleToggleDate(day)}
                            disabled={isPast}
                            className={`
                                aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all relative
                                ${isPast ? 'text-gray-300 opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                ${isUnavailable
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 shadow-inner'
                                    : 'bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                            `}
                        >
                            {day}
                            {isUnavailable && (
                                <span className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex gap-4 text-xs justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div>
                    <span className="text-gray-500">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                    <span className="text-gray-500">No Disponible</span>
                </div>
            </div>
        </div>
    );
}
