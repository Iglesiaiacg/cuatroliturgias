import { useState, useEffect, useCallback } from 'react';
import { startOfDay, isSameDay } from 'date-fns';

const EVENTS_STORAGE_KEY = 'parish_calendar_events';
const DIRECTORY_STORAGE_KEY = 'liturgia_directory';

// Helper to read data (pure function logic)
const readData = () => {
    // 1. Manual Events
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    const manual = stored ? JSON.parse(stored) : [];

    // 2. Directory Harvest
    const dirStored = localStorage.getItem(DIRECTORY_STORAGE_KEY);
    const members = dirStored ? JSON.parse(dirStored) : [];

    const harvested = [];

    members.forEach(m => {
        if (m.birthDate) {
            try {
                // Assuming birthDate is YYYY-MM-DD or similar standard
                const date = new Date(m.birthDate + 'T12:00:00'); // Midday to avoid timezone shifts
                if (!isNaN(date)) {
                    harvested.push({
                        id: `bd-${m.id}`,
                        title: `Cumpleaños de ${m.fullName.split(' ')[0]}`,
                        date: date, // Will be year-adjusted in getter
                        type: 'birthday',
                        color: 'blue' // UI indicator color
                    });
                }
            } catch (e) {
                console.error("Error parsing date for", m.fullName, e);
            }
        }
    });

    return { manual, harvested };
};

export function useCalendarEvents() {
    // Lazy initialization
    const [events, setEvents] = useState(() => readData().manual);
    const [directoryEvents, setDirectoryEvents] = useState(() => readData().harvested);

    // Refresh function (used for storage listener)
    const loadEvents = useCallback(() => {
        const { manual, harvested } = readData();
        setEvents(manual);
        setDirectoryEvents(harvested);
    }, []);

    // Listener for storage changes (sync across tabs/updates)
    useEffect(() => {
        // We already initialized via useState lazy init, so no need to call loadEvents() immediately on mount
        // unless we want to ensure freshness if storage changed between init and effect (rare).
        // Standard pattern: just listen.
        window.addEventListener('storage', loadEvents);
        return () => window.removeEventListener('storage', loadEvents);
    }, [loadEvents]);

    // Helpers
    const getEventsForDate = useCallback((date) => {
        if (!date) return [];
        const target = startOfDay(date);
        const targetYear = target.getFullYear();

        // Filter Manual
        const dayManual = events.filter(e => isSameDay(new Date(e.date), target));

        // Filter Directory (adjusted to current year)
        const dayDirectory = directoryEvents.filter(e => {
            const originalDate = new Date(e.date);
            // Handle leap years edge case if needed, but simple matching mainly:
            return originalDate.getDate() === target.getDate() &&
                originalDate.getMonth() === target.getMonth();
        }).map(e => ({
            ...e,
            date: target // Return with current year date for display logic
        }));

        // Special Sunday Tasks (Auto-generated)
        const dayAuto = [];
        if (target.getDay() === 0) { // Sunday
            dayAuto.push({
                id: 'auto-collection',
                title: 'Conteo de Ofrenda',
                type: 'finance',
                isAuto: true
            });
        }

        // Month End
        const dayOfMonth = target.getDate();
        const lastDay = new Date(targetYear, target.getMonth() + 1, 0).getDate();
        if (dayOfMonth === lastDay) {
            dayAuto.push({
                id: 'auto-report',
                title: 'Cierre Mensual',
                type: 'finance',
                isAuto: true
            });
        }

        return [...dayManual, ...dayDirectory, ...dayAuto];
    }, [events, directoryEvents]);

    const addEvent = useCallback((event) => {
        setEvents(prev => {
            const newEvents = [...prev, { ...event, id: crypto.randomUUID() }];
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
            return newEvents;
        });
    }, []);

    const deleteEvent = useCallback((id) => {
        setEvents(prev => {
            const newEvents = prev.filter(e => e.id !== id);
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
            return newEvents;
        });
    }, []);

    // Roster Management (Stored inside manual events for simplicity or separate key)
    // We'll store roster as a special event type='roster' per day
    const updateRoster = useCallback((date, positions) => {
        if (!date) return;
        setEvents(prev => {
            // Remove existing roster for this date
            const filtered = prev.filter(e => !(e.type === 'roster' && isSameDay(new Date(e.date), date)));

            const rosterEvent = {
                id: `roster-${date.toISOString()}`,
                date: date,
                type: 'roster',
                data: positions // { lector: 'Px', acolyte: 'Py' }
            };

            const newEvents = [...filtered, rosterEvent];
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
            return newEvents;
        });
    }, []);

    const getRoster = useCallback((date) => {
        if (!date) return {};
        // Note: 'events' dependency is needed here to get latest state
        return events.find(e => e.type === 'roster' && isSameDay(new Date(e.date), date))?.data || {};
    }, [events]);

    return {
        events,
        getEventsForDate,
        addEvent,
        deleteEvent,
        updateRoster,
        getRoster,
        refresh: loadEvents
    };
}
