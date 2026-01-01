import React, { useState } from 'react';

export default function GooeyNav({ onNavigate, activeTab, onProfile }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const handleNav = (tab) => {
        onNavigate(tab);
        setIsOpen(false);
    };

    return (
        <>
            {/* Backdrop to close when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-white/50 dark:bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`gooey-menu-container ${isOpen ? 'gooey-open' : ''} md:hidden`}>

                {/* Trigger Button */}
                <div className="menu-open-button" onClick={toggle}>
                    <span className="lines line-1"></span>
                    <span className="lines line-2"></span>
                    <span className="lines line-3"></span>
                </div>

                {/* Items - Reversed index for Z-index stacking usually, but here fixed */}

                {/* 1. Dashboard (Home) - Blue */}
                <button
                    onClick={() => handleNav('dashboard')}
                    className="menu-item blue"
                    title="Inicio"
                >
                    <span className="material-symbols-outlined text-3xl">home</span>
                </button>

                {/* 2. Calendar - Green */}
                <button
                    onClick={() => handleNav('calendar')}
                    className="menu-item green"
                    title="Calendario"
                >
                    <span className="material-symbols-outlined text-3xl">calendar_month</span>
                </button>

                {/* 3. Music - Purple */}
                <button
                    onClick={() => handleNav('music')}
                    className="menu-item purple"
                    title="Cantoral"
                >
                    <span className="material-symbols-outlined text-3xl">music_note</span>
                </button>

                {/* 4. Sacristy/Profile - Red */}
                {/* Logic: If user is sacristan, show sacristy? Or just generic Profile/Menu? 
                    Let's map this to PROFILE or ACTIONS. 
                    Actually, let's use it for 'Sacristy' or 'More'. 
                    Let's make it the PROFILE button as requested "Profile remains accessible". 
                */}
                <button
                    onClick={onProfile}
                    className="menu-item red"
                    title="Perfil"
                >
                    <span className="material-symbols-outlined text-3xl">person</span>
                </button>

            </div>
        </>
    );
}
