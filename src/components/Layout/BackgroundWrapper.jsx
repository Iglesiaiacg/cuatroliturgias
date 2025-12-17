import React from 'react';

/**
 * BackgroundWrapper
 * Renders a smooth, animated background mesh based on the liturgical season.
 */
export default function BackgroundWrapper({ season, children }) {

    // Map internal season names (from useLiturgy/algorithm) to CSS vars
    const getBackgroundClass = (s) => {
        if (!s) return 'bg-ordinary'; // Default

        const lower = s.toLowerCase();

        if (lower.includes('adviento')) return 'bg-advent';
        if (lower.includes('navidad') || lower.includes('pascua') || lower.includes('epifanía') || lower.includes('bautismo') || lower.includes('trinidad') || lower.includes('cristo rey') || lower.includes('santos')) return 'bg-festive';
        if (lower.includes('cuaresma') || lower.includes('ceniza') || lower.includes('semana santa') && !lower.includes('jueves')) return 'bg-lent';
        if (lower.includes('pentecostés') || lower.includes('mártir') || lower.includes('santo') || lower.includes('cruz') || lower.includes('domingo de ramos') || lower.includes('viernes santo')) return 'bg-martyr';

        return 'bg-ordinary'; // Tiempo Ordinario
    };

    const bgClass = getBackgroundClass(season);

    return (
        <div className="relative w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out">
            {/* Background Layer */}
            <div
                className="absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out"
                style={{
                    background: `var(--${bgClass})`,
                    backgroundColor: '#fafafa', // Fallback
                    backgroundSize: '200% 200%',
                    animation: 'gradientMove 15s ease infinite alternate'
                }}
            />

            {/* Scanline/Noise Texture (Optional, for "paper" feel) */}
            <div className="absolute inset-0 -z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Content */}
            <div className="relative z-0 h-full w-full">
                {children}
            </div>

            <style>{`
                @keyframes gradientMove {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                
                .bg-ordinary { --bg-current: var(--bg-ordinary); }
                .bg-advent { --bg-current: var(--bg-advent); }
                .bg-festive { --bg-current: var(--bg-festive); }
                .bg-lent { --bg-current: var(--bg-lent); }
                .bg-martyr { --bg-current: var(--bg-martyr); }
            `}</style>
        </div>
    );
}
