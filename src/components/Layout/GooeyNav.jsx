import React, { useState } from 'react';

export default function GooeyNav({ navItems = [], onNavigate, activeTab, onProfile }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const handleNav = (tab) => {
        onNavigate(tab);
        setIsOpen(false);
    };

    // --- DYNAMIC RADIAL LOGIC ---
    // Combine navItems + Profile for the ring
    const allItems = [
        ...navItems,
        { id: 'profile', label: 'Perfil', icon: 'person', action: onProfile }
    ];

    const radius = 110; // px
    const totalItems = allItems.length;
    const span = 160;   // Arc span in degrees
    const startAngle = -80; // Start angle

    // --- AUTO-SIZING LOGIC ---
    // Calculate arc length available per item
    // Circumference of full circle = 2 * PI * R
    // Arc Length = (Span/360) * Circumference
    // Max diameter per item ~= ArcLength / TotalItems
    // We add a safety margin (gap).

    // Standard size is 80px (w-20).
    // Let's calculate proportional size.

    const arcLength = (span / 360) * (2 * Math.PI * radius);
    const maxDiameter = (arcLength / totalItems) * 0.9; // 90% of slot to allow gap

    // Clamp size: Min 40px, Max 80px
    const bubbleSize = Math.min(Math.max(maxDiameter, 40), 80);

    // Offset for centering (margin-left: -size/2)
    const marginOffset = -(bubbleSize / 2);

    const getItemStyle = (index) => {
        if (!isOpen) return {};

        if (totalItems === 0) return {};

        let angle;
        if (totalItems === 1) {
            angle = 0;
        } else {
            const step = span / (totalItems - 1);
            angle = startAngle + (index * step);
        }

        const rad = angle * (Math.PI / 180);
        const x = radius * Math.sin(rad);
        const y = -radius * Math.cos(rad);

        return {
            transform: `translate3d(${x}px, ${y}px, 0)`,
            width: `${bubbleSize}px`,
            height: `${bubbleSize}px`,
            marginLeft: `${marginOffset}px`,
            marginTop: `${marginOffset}px`, // Center vertically too relative to 0,0
            lineHeight: `${bubbleSize}px` // Center text/icon vertically
        };
    };

    return (
        <>
            {/* Backdrop to close when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-white/60 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
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

                {/* Render Dynamic Items */}
                {allItems.map((item, index) => {
                    // GRAYSCALE COLOR SCHEME (User Request)
                    // Alternate between White and Gray
                    // White bubble -> Dark Icon
                    // Gray bubble -> Dark Icon (or White if dark enough)
                    // Let's use Stone-100 (Light Gray) and White.

                    const isEven = index % 2 === 0;

                    // Tailwind classes for colors
                    // We need to apply these classes conditionaly but "menu-item" class enforces background usually?
                    // The original CSS uses .menu-item.blue { background... }
                    // We will override background via style or class.
                    // Let's use generic styles.

                    const bgClass = isEven
                        ? 'bg-stone-200 text-stone-800' // Gray Bubble
                        : 'bg-white text-stone-800';    // White Bubble

                    // If active, maybe highlight? 
                    const isActive = activeTab === item.id;
                    const ringClass = isActive ? 'ring-4 ring-red-500/30' : '';

                    const style = isOpen
                        ? getItemStyle(index)
                        : {
                            transform: 'translate3d(0,0,0)',
                            width: `${bubbleSize}px`,
                            height: `${bubbleSize}px`,
                            marginLeft: `${marginOffset}px`,
                            marginTop: `${marginOffset}px`
                        };

                    // Dynamic Transition Delay
                    const transitionDelay = isOpen ? `${index * 40}ms` : '0ms';

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : handleNav(item.id)}
                            className={`menu-item shadow-lg ${bgClass} ${ringClass}`}
                            style={{
                                ...style,
                                transitionDelay,
                                // Override CSS defaults if any
                                position: 'absolute',
                                left: '50%',
                                top: '0px', // Anchor at top center of container
                                borderRadius: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform ease-out 200ms, width 200ms, height 200ms'
                            }}
                            title={item.label}
                        >
                            {/* Scale icon based on bubble size */}
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: `${bubbleSize * 0.5}px` }}
                            >
                                {item.icon}
                            </span>
                        </button>
                    );
                })}

            </div>
        </>
    );
}
