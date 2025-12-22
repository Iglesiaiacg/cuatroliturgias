import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme] = useState('light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
    }, []);

    const value = {
        theme,
        setTheme: () => { }, // No-op
    };

    return (
        <ThemeContext.Provider value={value} >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
