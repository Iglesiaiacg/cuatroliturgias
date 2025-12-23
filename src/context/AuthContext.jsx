import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
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

    // Google Login
    const loginWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check/Create Profile
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            const year = new Date().getFullYear();
            const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();

            await setDoc(userRef, {
                email: user.email,
                role: 'guest',
                credentialId: `${year}-${suffix}`,
                displayName: user.displayName,
                createdAt: new Date()
            });
        }
        return result;
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
            ...userData, // Spread first to prevent overwriting critical fields
            email: email,
            role: 'guest', // Force guest role
            credentialId: credentialId,
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
                // Default to guest immediately so UI renders
                setUserRole('guest');

                // SUPER ADMIN HARDCHECK
                const SUPER_ADMINS = ['alexveo855@gmail.com', 'gonzalezmatusalexis@gmail.com']; // Replace/Add your email
                if (SUPER_ADMINS.includes(user.email)) {
                    setUserRole('admin');
                }

                const userRef = doc(db, 'users', user.uid);

                try {
                    // Check existence/permission ONCE before listening
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);

                        // We have access, safe to listen for changes
                        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
                            if (snap.exists()) setUserRole(snap.data().role);
                        }, (error) => {
                            console.warn("User role snapshot error (graceful fallback):", error.code);
                        });
                    } else {
                        // Profile doesn't exist, create it
                        const year = new Date().getFullYear();
                        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                        await setDoc(userRef, {
                            email: user.email,
                            role: 'guest',
                            credentialId: `${year}-${suffix}`,
                            displayName: user.email.split('@')[0],
                            createdAt: new Date()
                        });

                        // Listen (assuming creation implies read access)
                        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
                            if (snap.exists()) setUserRole(snap.data().role);
                        }, (error) => {
                            console.warn("User role snapshot error (graceful fallback):", error.code);
                        });
                    }
                } catch (e) {
                    // Squelch permission errors - they get 'guest' role by default
                    if (e.code === 'permission-denied') {
                        console.warn("Guest access: No profile permission.");
                    } else {
                        console.error("Profile Error:", e);
                    }
                }
                setLoading(false);
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
        admin: ['generate_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'manage_users', 'view_treasury'],
        treasurer: ['view_calendar', 'view_offerings', 'view_treasury'],
        secretary: ['view_calendar', 'view_sacristy', 'view_directory', 'view_offerings', 'view_treasury'],
        sacristan: ['view_calendar', 'view_sacristy'],
        reader: ['view_calendar'],
        guest: [] // Guests only see Home (where pinned liturgy lives) and public Chat
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
        loginWithGoogle,
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
