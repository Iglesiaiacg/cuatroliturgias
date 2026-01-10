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
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
        // Security Check: Client-side enforcement
        if (userRole !== 'admin') {
            console.error("Critical: Unauthorized attempt to assign role.");
            throw new Error("No tienes permisos para realizar esta acción.");
        }

        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            role: role,
            displayName: displayName, // Update name if provided
            updatedAt: new Date()
        }, { merge: true });
    }, [userRole]);

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

                // SUPER ADMIN HARDCHECK (Case Insensitive)
                const superAdmins = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
                const normalizedEmail = user.email.toLowerCase();
                const isSuperAdmin = superAdmins.includes(normalizedEmail);

                // PRE-EMPTIVE ROLE ASSIGNMENT
                // If Super Admin, grant access immediately so UI works even if Firestore permissions fail
                if (isSuperAdmin) {
                    setUserRole('admin');
                } else {
                    setUserRole('guest');
                }

                const userRef = doc(db, 'users', user.uid);

                // Listen to User Document
                unsubscribeUserDoc = onSnapshot(userRef, async (snap) => {
                    if (snap.exists()) {
                        const dbRole = snap.data().role;

                        // Fix Super Admin role if drifted
                        if (isSuperAdmin && dbRole !== 'admin') {
                            updateDoc(userRef, { role: 'admin' }).catch(e => console.error("Auto-fix admin error:", e));
                        }

                        // Update State
                        if (isSuperAdmin) {
                            setUserRole('admin');
                        } else {
                            setUserRole(dbRole);
                        }
                    } else {
                        // Profile doesn't exist, create it
                        // Check if we are creating now to avoid loops
                        // (Snapshot will fire again after create)
                        try {
                            const year = new Date().getFullYear();
                            const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                            const initialRole = isSuperAdmin ? 'admin' : 'guest';

                            await setDoc(userRef, {
                                email: user.email,
                                role: initialRole,
                                credentialId: `${year}-${suffix}`,
                                displayName: user.email.split('@')[0],
                                createdAt: new Date()
                            });
                        } catch (e) {
                            console.error("Error creating profile:", e);
                        }
                    }
                    setLoading(false);
                }, (error) => {
                    console.warn("User role snapshot error:", error.code);
                    setUserRole('guest'); // Fallback
                    setLoading(false);
                });
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

        admin: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_directory', 'manage_directory', 'view_offerings', 'manage_users', 'view_treasury', 'manage_treasury', 'view_music', 'manage_music', 'view_dashboard_admin', 'manage_communication'],
        treasurer: ['view_liturgy', 'view_calendar', 'view_offerings', 'view_treasury', 'manage_treasury', 'view_dashboard_treasurer', 'manage_communication'],
        secretary: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_directory', 'manage_directory', 'view_offerings', 'view_dashboard_secretary', 'manage_communication'],
        sacristan: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_dashboard_sacristan', 'manage_communication', 'view_offerings'],
        musician: ['view_liturgy', 'view_calendar', 'view_music', 'manage_music', 'view_dashboard_musician', 'manage_communication', 'view_offerings'],
        acolyte: ['view_liturgy', 'view_calendar', 'view_dashboard_acolyte', 'manage_communication', 'view_offerings'],
        reader: ['view_liturgy', 'view_calendar', 'view_offerings'],
        guest: ['view_liturgy', 'view_offerings'] // Guests now see Digital Offering
    };

    const [previewRole, setPreviewRole] = useState(null); // START OF CHANGES

    // Derived effective role for UI
    const effectiveRole = previewRole || userRole;

    // START: Dynamic Permissions Loading
    const [customPermissions, setCustomPermissions] = useState({});

    useEffect(() => {
        if (!currentUser) return; // Only listen if authenticated

        // Listen to global permissions changes
        const unsubscribePerms = onSnapshot(doc(db, 'settings', 'permissions'), (docSnap) => {
            if (docSnap.exists()) {
                setCustomPermissions(docSnap.data());
            }
        }, (error) => {
            // Ignore permission errors if they happen during logout/initial load
            if (error.code !== 'permission-denied') {
                console.error("Error loading global permissions:", error);
            }
        });
        return () => unsubscribePerms();
    }, [currentUser]);

    const checkPermission = useCallback((permissionId) => {
        if (!effectiveRole) return false;

        // SUPER ADMIN EXCLUSIVE: Only specific emails can generate liturgy
        if (permissionId === 'generate_liturgy') {
            const superAdmins = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
            return currentUser && superAdmins.includes(currentUser.email.toLowerCase());
        }

        // ADMIN Override: IF acting as admin (no preview) -> ALL Access (except generate_liturgy which is restricted above)
        // IF acting as preview (e.g. sacristan) -> Only that role's access
        if (effectiveRole === 'admin') return true;

        // Use saved Custom Permissions if valid, otherwise fallback to Default
        const source = (Object.keys(customPermissions).length > 0) ? customPermissions : DEFAULT_PERMISSIONS;
        const rolePerms = source[effectiveRole] || [];
        return rolePerms.includes(permissionId);
    }, [effectiveRole, currentUser, customPermissions]);

    const value = {
        currentUser,
        userRole: effectiveRole, // EXPOSE EFFECTIVE ROLE so components react to preview
        realRole: userRole,      // Expose real role for Admin controls
        previewRole,             // Expose preview state
        setPreviewRole,          // Expose setter
        login,
        loginWithGoogle,
        signup,
        logout,
        assignRole,
        checkPermission
    };

    return (
        <AuthContext.Provider value={value} >
            {!loading && children
            }
        </AuthContext.Provider >
    );
}
