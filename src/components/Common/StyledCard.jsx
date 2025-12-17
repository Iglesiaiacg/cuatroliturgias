
import React from 'react';

export default function StyledCard({ title, description, icon, onClick, actionText = "Abrir" }) {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center p-4 m-0 
            bg-white dark:bg-surface-dark/50 rounded-lg shadow-sm
            border border-gray-100 dark:border-white/5
            transition-all duration-300 ease-out
            hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-primary)]/30
            cursor-pointer w-full text-center h-full"
        >
            {/* Icon Container - Compact & Light */}
            <div className="mb-3 p-3 rounded-full 
                bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10
                text-[var(--color-primary)]
                transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--color-primary)]/10">
                <span className="material-symbols-outlined text-3xl">
                    {icon}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-base text-gray-900 dark:text-gray-100 
                group-hover:text-[var(--color-primary)] transition-colors duration-300 mb-1">
                {title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed px-2">
                {description}
            </p>

            {/* Subtle Action Indicator */}
            <div className="mt-auto pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-primary)] flex items-center gap-1">
                    {actionText} <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </span>
            </div>
        </button>
    );
}
