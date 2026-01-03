import { db } from './firebase';
import { doc, deleteDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // Fallback if simple ID needed

// --- PERMISSIONS CONSTANTS (Mirrored from AuthContext) ---
const PERMISSIONS = {
    // Map 'collection_alias' -> 'required_permission'
    'calendario': 'manage_communication', // Write access to calendar (events/reminders)
    'fieles': 'manage_directory',       // Write access to directory
    'usuarios': 'manage_users'          // Write access to system users
};

// Role Definitions (Simplified Mirror)
const ROLE_CAPABILITIES = {
    admin: ['ALL'],
    treasurer: ['manage_treasury', 'manage_communication'],
    secretary: ['manage_sacristy', 'manage_directory', 'manage_treasury', 'manage_communication'],
    sacristan: ['manage_sacristy', 'manage_communication'],
    musician: ['manage_music', 'manage_communication'],
    acolyte: ['manage_communication'],
    reader: [],
    guest: []
};

// --- HELPER FUNCTIONS ---

/**
 * Validates if a user role can perform a write action on a target.
 */
export const validateAiAction = (role, target) => {
    if (!role) return false;
    if (role === 'admin') return true;

    const requiredPerm = PERMISSIONS[target];
    if (!requiredPerm) {
        console.warn(`AI Safety: Unknown target '${target}'`);
        return false;
    }

    const capabilities = ROLE_CAPABILITIES[role] || [];
    return capabilities.includes(requiredPerm) || capabilities.includes('ALL');
};

/**
 * Executes the confirmed action.
 * @param {string} actionType - CREATE, UPDATE, DELETE
 * @param {string} target - 'calendario', 'fieles'
 * @param {object} data - The payload
 */
export const executeAiAction = async (actionType, target, data) => {
    console.log(`[AI SERVICE] Executing ${actionType} on ${target}`, data);

    try {
        // --- CALENDAR (LocalStorage) ---
        if (target === 'calendario') {
            const STORAGE_KEY = 'parish_calendar_events';
            const stored = localStorage.getItem(STORAGE_KEY);
            let events = stored ? JSON.parse(stored) : [];

            if (actionType === 'CREATE') {
                const newEvent = {
                    id: data.id || crypto.randomUUID(),
                    ...data,
                    // Ensure Date objects are strings for JSON
                    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
                };
                events.push(newEvent);
            }
            else if (actionType === 'UPDATE') {
                events = events.map(e => e.id === data.id ? { ...e, ...data } : e);
            }
            else if (actionType === 'DELETE') {
                // Delete by ID or roughly by precise title/date match if ID missing (risky but handled by AI context)
                if (data.id) {
                    events = events.filter(e => e.id !== data.id);
                } else {
                    throw new Error("ID requerido para eliminar evento.");
                }
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
            // Dispatch event to update hooks
            window.dispatchEvent(new Event('storage'));
            return { success: true, message: "Calendario actualizado." };
        }

        // --- FIELES (Firestore 'users') ---
        if (target === 'fieles') {
            const COL_NAME = 'users';

            if (actionType === 'CREATE') {
                await addDoc(collection(db, COL_NAME), {
                    ...data,
                    createdAt: new Date(),
                    origin: 'ai_assistant'
                });
            }
            else if (actionType === 'UPDATE') {
                if (!data.id) throw new Error("ID requerido para actualizar fiel.");
                const ref = doc(db, COL_NAME, data.id);
                // Remove ID from data payload
                const { id, ...updates } = data;
                await updateDoc(ref, updates);
            }
            else if (actionType === 'DELETE') {
                if (!data.id) throw new Error("ID requerido para eliminar fiel.");
                await deleteDoc(doc(db, COL_NAME, data.id));
            }
            return { success: true, message: "Directorio de fieles actualizado." };
        }

        throw new Error(`Objetivo '${target}' no soportado.`);

    } catch (error) {
        console.error("AI Action Failed:", error);
        throw error;
    }
};
