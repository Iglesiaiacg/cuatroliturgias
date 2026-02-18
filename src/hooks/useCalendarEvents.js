import { useState, useEffect, useCallback } from 'react';
import { startOfDay, isSameDay } from 'date-fns';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';

export function useCalendarEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Subscribe to Firestore 'events'
    useEffect(() => {
        if (!currentUser) {
            setEvents(prev => prev.length === 0 ? prev : []);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Can filter by month range if needed for performance, currently fetching all
        const q = query(collection(db, 'events'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Timestamp to Date if exists, else keep as string (legacy safety)
                    date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
                };
            });
            setEvents(list);
            setLoading(false);
        }, (error) => {
            if (error.code !== 'permission-denied') console.error("Calendar Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getEventsForDate = useCallback((date) => {
        if (!date) return [];
        const target = startOfDay(date);

        // 1. Firestore Events
        const dayEvents = events.filter(e => isSameDay(new Date(e.date), target));

        // 2. Special Sunday Tasks (Auto-generated)
        const dayAuto = [];
        if (target.getDay() === 0) { // Sunday
            dayAuto.push({
                id: 'auto-collection',
                title: 'Conteo de Ofrenda',
                type: 'finance',
                isAuto: true
            });
        }

        // 3. Month End
        const dayOfMonth = target.getDate();
        const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
        if (dayOfMonth === lastDay) {
            dayAuto.push({
                id: 'auto-report',
                title: 'Cierre Mensual',
                type: 'finance',
                isAuto: true
            });
        }

        return [...dayEvents, ...dayAuto];
    }, [events]);

    const addEvent = useCallback(async (event) => {
        try {
            await addDoc(collection(db, 'events'), {
                ...event,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding event:", e);
            throw e;
        }
    }, []);

    const deleteEvent = useCallback(async (id) => {
        try {
            await deleteDoc(doc(db, 'events', id));
        } catch (e) {
            console.error("Error deleting event:", e);
            throw e;
        }
    }, []);

    // Roster Management (Stored as event type='roster')
    const updateRoster = useCallback(async (date, positions) => {
        if (!date) return;

        // Find existing roster for this date to update (or delete then create)
        // Ideally we use a consistent ID based on date, e.g., 'roster_YYYY-MM-DD'
        // But Firestore auto-IDs are safer for concurrency.
        // Let's search first.
        const target = startOfDay(date);
        const existing = events.find(e => e.type === 'roster' && isSameDay(new Date(e.date), target));

        try {
            if (existing) {
                await deleteDoc(doc(db, 'events', existing.id));
            }
            await addDoc(collection(db, 'events'), {
                date: date,
                type: 'roster',
                data: positions, // { lector: 'Px', acolyte: 'Py' }
                updatedAt: new Date()
            });
        } catch (e) {
            console.error("Error updating roster:", e);
        }
    }, [events]);

    const getRoster = useCallback((date) => {
        if (!date) return {};
        const target = startOfDay(date);
        return events.find(e => e.type === 'roster' && isSameDay(new Date(e.date), target))?.data || {};
    }, [events]);

    // Daily Reminder Management
    const updateDailyReminder = async (date, text) => {
        if (!date) return;
        const target = startOfDay(date);
        const existing = events.find(e => e.type === 'daily_reminder' && isSameDay(new Date(e.date), target));

        try {
            if (existing) {
                await deleteDoc(doc(db, 'events', existing.id));
            }
            if (text && text.trim() !== '') {
                await addDoc(collection(db, 'events'), {
                    date: date,
                    type: 'daily_reminder',
                    title: text,
                    updatedAt: new Date()
                });
            }
        } catch (e) {
            console.error("Error updating reminder:", e);
        }
    };

    const getDailyReminder = (date) => {
        const target = startOfDay(date);
        return events.find(e => e.type === 'daily_reminder' && isSameDay(new Date(e.date), target))?.title || '';
    };

    return {
        events,
        getEventsForDate,
        addEvent,
        deleteEvent,
        updateRoster,
        getRoster,
        updateDailyReminder,
        getDailyReminder,
        loading
    };
}
