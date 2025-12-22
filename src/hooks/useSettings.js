import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'parish_app_settings';

const DEFAULT_SETTINGS = {
    rubricLevel: 'solemn', // 'simple' or 'solemn'
    fontSize: 'medium',    // 'small', 'medium', 'large'
    showChords: true
};

export function useSettings() {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        } catch (e) {
            console.error("Error loading settings:", e);
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

        // Apply global classes for CSS-based toggling
        const root = document.documentElement;
        if (settings.rubricLevel === 'simple') {
            root.classList.add('rubrics-simple');
        } else {
            root.classList.remove('rubrics-simple');
        }

    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return { settings, updateSetting };
}
