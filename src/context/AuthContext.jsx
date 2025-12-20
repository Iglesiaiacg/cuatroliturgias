import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Login (LoginView uses this)
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    // Admin function to create sub-users
    async function createSubUser(email, password, role, name) {
        // Note: Firebase Auth doesn't easily allow creating a SECOND user while logged in as the FIRST
        // without logging out the first.
        // For a simple 'internal tool' MVP, we can use a secondary "Firebase Admin" app instance 
        // OR simply creating it temporarily.
        // A common pattern for client-side app-creation without backend functions:
        // 1. Current admin logs out. 2. Create new account. 3. Re-login as admin.
        // BUT for MVP simplicity, we might just assume manual creation in console OR 
        // implement a Cloud Function later.

        // Let's stick to the simplest approach: Map UID to Role in Firestore.
        // The user must be created.
        throw new Error("La creación directa requiere función de backend. Por ahora crea el usuario en consola y asígnale rol aquí.");
    }

    // Helper to manually assign role to a UID (used during development/setup)
    async function assignRole(uid, role, name) {
        await setDoc(doc(db, 'users', uid), {
            role,
            displayName: name,
            updatedAt: new Date()
        }, { merge: true });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, fetch role from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role);
                } else {
                    // Default fallback or 'pending'
                    setUserRole('guest');
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        logout,
        assignRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
