const KEYS = {
    TRADITION: 'liturgy_tradition',
    CELEBRATION: 'liturgy_celebration',
    HISTORY: 'liturgy_history',
    API_KEY: 'liturgy_api_key' // New secure key
};

export const getApiKey = () => {
    return localStorage.getItem(KEYS.API_KEY) || "AIzaSyAmH9G7lmfnwWDaABRZiF-dSMbrODaXqVY" || import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
}

export const saveApiKey = (key) => {
    if (key) {
        localStorage.setItem(KEYS.API_KEY, key);
    } else {
        localStorage.removeItem(KEYS.API_KEY);
    }
}

export const getPreferences = () => {
    return {
        tradition: localStorage.getItem(KEYS.TRADITION) || 'anglicana',
        celebrationKey: localStorage.getItem(KEYS.CELEBRATION) || 'HOY_CALENDARIO'
    };
};

export const savePreferences = (tradition, celebrationKey) => {
    if (tradition) localStorage.setItem(KEYS.TRADITION, tradition);
    if (celebrationKey) localStorage.setItem(KEYS.CELEBRATION, celebrationKey);
};

export const getHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [];
    } catch {
        return [];
    }
};

export const addToHistory = (htmlContent, title, tradition) => {
    const item = {
        id: Date.now(),
        date: new Date().toISOString(),
        title: title,
        tradition: tradition,
        content: htmlContent
    };
    let history = getHistory();
    history.unshift(item);
    if (history.length > 5) history.pop(); // Keep only last 5
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    return history;
};
