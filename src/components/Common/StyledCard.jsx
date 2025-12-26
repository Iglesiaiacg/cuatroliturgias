
import React from 'react';

export default function StyledCard({ title, description, icon, onClick, actionText = "Abrir" }) {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center p-6 m-0 
            neumorphic-card
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:shadow-lg
            cursor-pointer w-full text-center h-full active:scale-[0.98]"
        >
            {/* Icon Container - Solemn Circle */}
            <div className="mb-4 p-4 rounded-full 
                bg-amber-100 dark:bg-amber-900/30
                text-[var(--color-primary)]
                transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                <span className="material-symbols-outlined text-4xl">
                    {icon}
                </span>
            </div>

            {/* Title - Serif Display */}
            <h3 className="font-display font-medium text-xl text-[var(--color-primary)] dark:text-[var(--text-display)]
                group-hover:text-[var(--color-primary-light)] transition-colors duration-300 mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed px-2">
                {description}
            </p>

            {/* Subtle Action Indicator */}
            <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--color-primary)] flex items-center gap-1 border-b border-[var(--color-primary)] pb-0.5">
                    {actionText}
                </span>
            </div>
        </button>
    );
}
