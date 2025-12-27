import React from 'react';

/**
 * MinistryOrbit Component
 * Based on "Planetary Orbit" design.
 * Adapts to Liturgical colors and Material Symbols.
 * 
 * @param {string} photo - User profile photo URL
 * @param {string} initial - User initial if no photo
 * @param {string} role - Primary User Role (Center)
 * @param {Array} ministries - Array of objects { id, icon, label, color } for the planets
 */
export default function MinistryOrbit({ photo, initial, role, ministries = [] }) {

    // Helper to position planets in a circle
    // We start from -90deg (top) and distribute evenly
    const getPositionStyle = (index, total) => {
        if (total === 0) return {};

        // Custom fixed positions for specific counts to look aesthetically pleasing like the original design
        // Original design used: Top-Left, Top-Right, Bottom-Left, Bottom-Right, etc.
        const positions = [
            { top: '-4px', left: '45px' },   // Top Center-ish
            { top: '-4px', right: '45px' },  // Top Right-ish
            { top: '80px', right: '-16px' }, // Right
            { bottom: '32px', right: '0px' }, // Bottom Right
            { bottom: '32px', left: '0px' },  // Bottom Left
            { top: '80px', left: '-16px' },  // Left
        ];

        // If we have fewer items than positions, map them directly. 
        // If more, we might need dynamic calculation, but for now max 6 ministries is reasonable.
        return positions[index % positions.length];
    };

    return (
        <div className="relative h-64 w-full flex items-center justify-center my-4">
            {/* Dashed Orbit Ring */}
            <div className="relative p-10 border-2 border-dashed rounded-full border-spacing-4 border-gray-300 dark:border-white/20 w-64 h-64 flex items-center justify-center">

                {/* PLANETS (Ministries) */}
                {ministries.map((min, index) => (
                    <div
                        key={min.id || index}
                        className="absolute w-12 h-12 rounded-full cursor-pointer border border-gray-200 dark:border-white/10 p-[2px] active:scale-95 hover:scale-110 transition-all duration-500 bg-[var(--bg-main)] z-10 shadow-sm"
                        style={getPositionStyle(index, ministries.length)}
                        title={min.label}
                    >
                        <div className={`w-full h-full rounded-full flex items-center justify-center bg-[var(--bg-card)] ${min.color || 'text-primary'}`}>
                            <span className="material-symbols-outlined text-xl">{min.icon}</span>
                        </div>
                        {/* Tooltip Label */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {min.label}
                        </div>
                    </div>
                ))}

                {/* SUN (User Profile) */}
                <div className="w-32 h-32 p-1 border-2 border-gray-200 dark:border-white/10 rounded-full hover:border-primary/50 cursor-pointer transition-all duration-500 z-0 bg-[var(--bg-card)] shadow-lg">
                    <div className="w-full h-full bg-[var(--bg-card)] flex flex-col items-center justify-center rounded-full active:scale-95 hover:scale-95 overflow-hidden transition-all duration-500 relative">
                        {photo ? (
                            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-display font-bold text-gray-400 dark:text-gray-500">
                                {initial}
                            </span>
                        )}

                        {/* Role Badge inside Sun */}
                        <div className="absolute bottom-4 bg-primary/90 text-white text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                            {role}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
