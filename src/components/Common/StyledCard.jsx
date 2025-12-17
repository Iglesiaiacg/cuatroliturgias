
import React from 'react';

export default function StyledCard({ title, description, icon, onClick, actionText = "Abrir" }) {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-2 px-6 py-6 m-2 
            bg-white dark:bg-white/5 rounded-lg shadow-lg overflow-hidden cursor-pointer
            transition-all duration-300 hover:shadow-xl
            after:absolute after:h-full after:w-full after:inset-0 after:-z-20 after:bg-[var(--color-primary)] 
            after:rounded-lg after:transition-all after:duration-500 after:-translate-y-full after:hover:translate-y-0
            [&_p]:transition-all [&_p]:delay-200"
        >
            {/* Icon Container - Scaled up/styled to match the visual weight of the user's SVG */}
            <div className="relative z-20 w-24 h-24 mb-2 flex items-center justify-center rounded-full 
                bg-gray-100 dark:bg-white/5 group-hover:bg-white/20 
                border border-[var(--color-primary)]/20 group-hover:border-white/20
                text-[var(--color-primary)] group-hover:text-white
                transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                <span className="material-symbols-outlined text-5xl">
                    {icon}
                </span>
            </div>

            {/* Title */}
            <p className="z-20 font-display font-bold text-xl text-center text-gray-900 dark:text-gray-100 group-hover:text-white tracking-wider">
                {title}
            </p>

            {/* Description */}
            <p className="z-20 text-xs font-semibold text-center text-gray-500 dark:text-gray-400 group-hover:text-white/90 line-clamp-2 min-h-[2.5em]">
                {description}
            </p>

            {/* Action Row */}
            <div className="z-20 w-full mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <p className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full shadow-sm hover:bg-white/30 transition-colors">
                    {actionText}
                </p>
            </div>

            {/* Decorative background circle (optional, mimicking the user's SVG complexity if desired, but keeping it simple for now) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                {/* This could be a texture or pattern */}
            </div>
        </div>
    );
}
