import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Using manual fetch for now or onSnapshot? onSnapshot is better for realtime.
import { onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function PendingCertificatesCard() {
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Assume 'certificates' collection exists with 'status' field
        const q = query(
            collection(db, 'certificates'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingCount(snapshot.size);
            setLoading(false);
        }, (error) => {
            console.log("Certificates collection might not exist yet, defaulting to 0.");
            setPendingCount(0);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return null; // Or skeleton

    const hasPending = pendingCount > 0;

    return (
        <div className={`neumorphic-card p-6 h-full flex items-center justify-between border-l-4 ${hasPending ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-green-500 bg-white dark:bg-stone-900'}`}>
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Despacho Parroquial</span>
                </div>
                <div>
                    <span className={`text-2xl font-bold ${hasPending ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                        {pendingCount}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">
                        {hasPending ? 'Documentos Pendientes' : 'Todo en orden'}
                    </span>
                </div>
            </div>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasPending ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                <span className="material-symbols-outlined">
                    {hasPending ? 'priority_high' : 'check'}
                </span>
            </div>
        </div>
    );
}
