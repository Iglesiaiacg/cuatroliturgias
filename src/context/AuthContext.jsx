import { createContext, useContext, useState, useEffect } from 'react';
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
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Sign Up with Credential ID
    async function signup(email, password, userData = {}) {
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
    }

    // Assign Role (Admin Function)
    async function assignRole(uid, role, displayName) {
        if (!userRole === 'admin') throw new Error("Solo administradores pueden asignar roles");

        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            role: role,
            displayName: displayName, // Update name if provided
            updatedAt: new Date()
        }, { merge: true });
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let unsubscribeUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Listen to user role in real-time
                const userRef = doc(db, 'users', user.uid);

                // Backup auto-create (in case signup didn't run, e.g. direct auth)
                try {
                    const docSnap = await getDoc(userRef);
                    if (!docSnap.exists()) {
                        const year = new Date().getFullYear();
                        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                        await setDoc(userRef, {
                            email: user.email,
                            role: 'guest',
                            credentialId: `${year}-${suffix}`,
                            displayName: user.email.split('@')[0],
                            createdAt: new Date()
                        });
                    }
                } catch (e) {
                    console.error("Error auto-creating profile", e);
                }

                unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);
                    } else {
                        setUserRole('guest');
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user role:", error);
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
        secretary: ['view_liturgy', 'view_calendar', 'view_sacristy', 'view_directory', 'view_offerings'],
        sacristan: ['view_liturgy', 'view_calendar', 'view_sacristy'],
        reader: ['view_liturgy', 'view_calendar'],
        guest: ['view_liturgy']
    };

    function checkPermission(permissionId) {
        if (!userRole) return false;
        if (userRole === 'admin') return true; // Admin has all rights by default fallback

        // In a real app, we'd load these from DB. For now, use the constant map.
        // We could also allow passing overrides via props if needed, but Context is best.
        const rolePerms = DEFAULT_PERMISSIONS[userRole] || [];
        return rolePerms.includes(permissionId);
    }

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
