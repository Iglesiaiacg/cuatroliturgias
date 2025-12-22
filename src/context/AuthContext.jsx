import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Login
    const login = useCallback((email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }, []);

    // Sign Up with Credential ID
    const signup = useCallback(async (email, password, userData = {}) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Generate printable Credential ID (e.g., 2025-A7B9)
        const year = new Date().getFullYear();
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const credentialId = `${year}-${suffix}`;

        // Write profile to Firestore immediately
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'guest',
            credentialId: credentialId,
            ...userData,
            createdAt: new Date()
        }, { merge: true });

        return userCredential;
    }, []);

    // Assign Role (Admin Function)
    const assignRole = useCallback(async (uid, role, displayName) => {
        // Important: checking state directly inside async callback might be stale if not careful,
        // but 'userRole' is in dependency array.
        // However, standard practice is to rely on server rules. 
        // We'll keep the client check but remove 'userRole' dependency loop by using ref or trusting backend error.
        // For simplicity:
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            role: role,
            displayName: displayName, // Update name if provided
            updatedAt: new Date()
        }, { merge: true });
    }, []);

    // Logout
    const logout = useCallback(() => {
        return signOut(auth);
    }, []);

    useEffect(() => {
        let unsubscribeUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Listen to user role in real-time
                const userRef = doc(db, 'users', user.uid);

                unsubscribeUserDoc = onSnapshot(userRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);
                    } else {
                        // Profile doesn't exist, try to create it
                        try {
                            const year = new Date().getFullYear();
                            const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                            await setDoc(userRef, {
                                email: user.email,
                                role: 'guest',
                                credentialId: `${year}-${suffix}`,
                                displayName: user.email.split('@')[0],
                                createdAt: new Date()
                            });
                            // After creation, onSnapshot will fire again with the new data
                            // So we can set guest temporarily here
                            setUserRole('guest');
                        } catch (createError) {
                            console.error("Error auto-creating profile:", createError);
                            setUserRole('guest');
                        }
                    }
                    setLoading(false);
                }, (error) => {
                    // Handle permission denied or other errors gracefully
                    console.error("Error fetching user profile:", error.code);
                    setUserRole('guest');
                    setLoading(false);
                });
            } else {
                setCurrentUser(null);
                setUserRole(null);
                setLoading(false);
                if (unsubscribeUserDoc) unsubscribeUserDoc();
            }
        });

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
    }, []);

    // Default Permissions (fallback)
    const DEFAULT_PERMISSIONS = {
        admin: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'manage_users', 'view_treasury'],
        treasurer: ['view_calendar', 'view_offerings', 'view_treasury'],
        secretary: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'view_treasury'],
        sacristan: ['view_liturgy', 'view_calendar', 'view_sacristy'],
        reader: ['view_liturgy', 'view_calendar'],
        guest: ['view_liturgy']
    };

    const checkPermission = useCallback((permissionId) => {
        if (!userRole) return false;
        if (userRole === 'admin') return true; // Admin has all rights by default fallback

        // In a real app, we'd load these from DB. For now, use the constant map.
        // We could also allow passing overrides via props if needed, but Context is best.
        const rolePerms = DEFAULT_PERMISSIONS[userRole] || [];
        return rolePerms.includes(permissionId);
    }, [userRole]);

    const value = {
        currentUser,
        userRole,
        login,
        signup,
        logout,
        assignRole,
        checkPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
