import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const SETTINGS_DOC_ID = 'global_config';
const COLLECTION_NAME = 'system_settings';

/**
 * Fetches global system settings (API Keys, etc)
 * @returns {Promise<Object>}
 */
export const getGlobalSettings = async () => {
    try {
        const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.warn("No global settings found in Firestore.");
            return {};
        }
    } catch (error) {
        console.error("Error fetching global settings:", error);
        return {};
    }
};

/**
 * Saves global system settings.
 * RESTRICTED: Should only be called by Admin (enforced by Firestore Rules eventually, and client-side guards).
 * @param {Object} newSettings 
 */
export const saveGlobalSettings = async (newSettings) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
        // Merge true so we don't overwrite other future settings
        await setDoc(docRef, newSettings, { merge: true });
        console.log("Global settings saved to Firestore.");
        return true;
    } catch (error) {
        console.error("Error saving global settings:", error);
        throw error;
    }
};
