import React, { useState } from 'react';

export default function GooeyNav({ navItems = [], onNavigate, activeTab, onProfile }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const handleNav = (tab) => {
        onNavigate(tab);
        setIsOpen(false);
    };

    // --- DYNAMIC RADIAL LOGIC ---
    // We want to distribute items in a semi-circle around the top (180 degrees?).
    // Let's use an arc from -75deg (left) to 75deg (right) relative to Up (0deg).
    // Radius = 110px

    // Include Profile as the last item if needed, but the user requested "all buttons". 
    // Usually Profile is separate. Let's include it in the ring for "ALL items" access.

    // Combine navItems + Profile for the ring
    const allItems = [
        ...navItems,
        { id: 'profile', label: 'Perfil', icon: 'person', action: onProfile }
    ];

    const radius = 110; // px
    const totalItems = allItems.length;
    // Spread calculation
    // If 1 item: 0deg
    // If >1: Step between items
    // Span: 150 degrees (-75 to 75)
    // Start Angle: -75
    // Step: 150 / (total - 1)

    const span = 160;
    const startAngle = -80; // Left-ish

    const getItemStyle = (index) => {
        if (!isOpen) return {}; // Closed: translate(0,0) handled by CSS class unless overridden

        if (totalItems === 0) return {};

        let angle;
        if (totalItems === 1) {
            angle = 0;
        } else {
            const step = span / (totalItems - 1);
            angle = startAngle + (index * step);
        }

        // Convert to Radians (subtract 90 because 0 is usually Right in trig, but we want 0 to be UP)
        // Wait, standard trig: 0 is East (Right).
        // We want UP (North) to be -90deg or 270deg.
        // Let's rely on sin/cos mapping:
        // x = R * sin(angle)
        // y = -R * cos(angle) (Negative Y goes UP)

        const rad = angle * (Math.PI / 180);
        const x = radius * Math.sin(rad);
        const y = -radius * Math.cos(rad);

        return {
            transform: `translate3d(${x}px, ${y}px, 0)`
        };
    };

    // Color mapping cycling
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'lightblue'];

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
                    // Cycle colors
                    const colorClass = colors[index % colors.length];
                    const isActive = activeTab === item.id;
                    /* 
                       Note: we apply the style inline ONLY when open. 
                       But to animate from center, we need the class to handle the closed state (which is 0,0).
                       React inline style overrides CSS transform. 
                       So when isOpen is false, we pass empty style (or null) to let CSS 'translate3d(0,0,0)' take over?
                       Actually, if we unset the style, it reverts to CSS. 
                       The CSS has .menu-item { transform: translate3d(0,0,0) }. 
                       The CSS .gooey-open .menu-item was doing the move. 
                       We will override that by applying inline style ALWAYS, 
                       Wait, valid transition requires the property to be present.
                       We should apply the TARGET position as inline style, 
                       and let the transition property (in CSS) handle the movement.
                       
                       BUT: if we inline `transform: translate(0,0)` when closed, it works.
                    */

                    const style = isOpen ? getItemStyle(index) : { transform: 'translate3d(0,0,0)' };

                    // Delay calculation for staggered effect (optional)
                    // CSS had: transition-duration: 180ms...
                    // We can add dynamic delay inline too.
                    const transitionDelay = isOpen ? `${index * 50}ms` : '0ms';

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : handleNav(item.id)}
                            className={`menu-item ${colorClass} ${isActive ? 'ring-4 ring-white/50' : ''}`}
                            style={{ ...style, transitionDelay }}
                            title={item.label}
                        >
                            <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                            {/* Optional: Label? Too small. Icon is best. */}
                        </button>
                    );
                })}

            </div>
        </>
    );
}
