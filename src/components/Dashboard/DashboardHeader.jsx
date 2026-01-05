import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ date, showAdminDashboard, setShowAdminDashboard }) {
    const { userRole } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 20) return "Buenas tardes";
        return "Buenas noches";
    };

    return (
        <div className="mb-2 md:text-center flex flex-col md:items-center animate-fade-in">
            <div className="flex justify-between items-center w-full md:justify-center md:flex-col md:gap-2">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                        {getGreeting()}, <span className="text-primary">Padre</span>.
                    </h1>
                    <p className="text-gray-600 dark:text-gray-500 capitalize">
                        {date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(date) : 'Bienvenido'}
                    </p>
                </div>

                {/* Mode Toggle Button - Only for Admin/Priest roles */}
                {(userRole === 'admin' || userRole === 'priest') && (
                    <button
                        onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-2
                        ${!showAdminDashboard
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/10'}`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {!showAdminDashboard ? 'church' : 'dashboard'}
                        </span>
                        {!showAdminDashboard ? 'Modo Celebrante' : 'Modo Director'}
                    </button>
                )}
            </div>
        </div>
    );
}
