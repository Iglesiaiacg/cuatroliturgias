import { useState, useEffect, useCallback } from 'react';
import { startOfDay, isSameDay, parse, setYear, format } from 'date-fns';

const EVENTS_STORAGE_KEY = 'parish_calendar_events';
const DIRECTORY_STORAGE_KEY = 'liturgia_directory';

export function useCalendarEvents() {
    const [events, setEvents] = useState([]);
    const [directoryEvents, setDirectoryEvents] = useState([]);

    // Load data
    const loadEvents = useCallback(() => {
        // 1. Manual Events
        const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
        const manual = stored ? JSON.parse(stored) : [];

        // 2. Directory Harvest
        const dirStored = localStorage.getItem(DIRECTORY_STORAGE_KEY);
        const members = dirStored ? JSON.parse(dirStored) : [];

        const harvested = [];
        const currentYear = new Date().getFullYear();

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
            // Add Wedding or Baptism here if fields exist
        });

        setEvents(manual);
        setDirectoryEvents(harvested);
    }, []);

    // Initial Load
    useEffect(() => {
        loadEvents();
        // Listener for storage changes (sync across tabs/updates)
        window.addEventListener('storage', loadEvents);
        return () => window.removeEventListener('storage', loadEvents);
    }, [loadEvents]);

    // Helpers
    const getEventsForDate = (date) => {
        const target = startOfDay(date);
        const targetYear = target.getFullYear();

        // Filter Manual
        const dayManual = events.filter(e => isSameDay(new Date(e.date), target));

        // Filter Directory (adjusted to current year)
        const dayDirectory = directoryEvents.filter(e => {
            const originalDate = new Date(e.date);
            const thisYearDate = setYear(originalDate, targetYear);
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
    };

    const addEvent = (event) => {
        const newEvents = [...events, { ...event, id: crypto.randomUUID() }];
        setEvents(newEvents);
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
        return newEvents;
    };

    const deleteEvent = (id) => {
        const newEvents = events.filter(e => e.id !== id);
        setEvents(newEvents);
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
    };

    // Roster Management (Stored inside manual events for simplicity or separate key)
    // We'll store roster as a special event type='roster' per day
    const updateRoster = (date, positions) => {
        // Remove existing roster for this date
        const filtered = events.filter(e => !(e.type === 'roster' && isSameDay(new Date(e.date), date)));

        const rosterEvent = {
            id: `roster-${date.toISOString()}`,
            date: date,
            type: 'roster',
            data: positions // { lector: 'Px', acolyte: 'Py' }
        };

        const newEvents = [...filtered, rosterEvent];
        setEvents(newEvents);
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
    };

    const getRoster = (date) => {
        return events.find(e => e.type === 'roster' && isSameDay(new Date(e.date), date))?.data || {};
    };

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
