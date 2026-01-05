import { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from './AuthContext';

const DirectoryContext = createContext();

export const useDirectory = () => {
    const context = useContext(DirectoryContext);
    if (!context) {
        throw new Error('useDirectory must be used within a DirectoryProvider');
    }
    return context;
};

export const DirectoryProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync with Firestore 'users' collection
    useEffect(() => {
        if (!currentUser) {
            setMembers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Map Auth fields to Directory fields if missing
                    fullName: data.fullName || data.displayName || 'Sin Nombre',
                    memberId: data.memberId || data.credentialId || 'PENDIENTE',
                    // Ensure other fields exist to avoid UI errors
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || '',
                    role: data.role || 'guest'
                };
            });
            setMembers(usersList);
            setLoading(false);
        }, (error) => {
            console.error("Error reading directory:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const generateMemberId = (fullName, currentList) => {
        if (!fullName) return '';
        const words = fullName.trim().toUpperCase().split(/\s+/);
        const initials = words.slice(0, 3).map(w => w[0]).join('');
        const prefix = `IACG_${initials}`;
        const matchingIds = currentList
            .filter(m => m.memberId && m.memberId.startsWith(prefix))
            .map(m => {
                const parts = m.memberId.split('_');
                return parseInt(parts[parts.length - 1]) || 0;
            });
        const nextNum = (matchingIds.length > 0 ? Math.max(...matchingIds) : 0) + 1;
        return `${prefix}_${nextNum.toString().padStart(3, '0')}`;
    };

    const addMember = async (memberData) => {
        try {
            const dataToSave = { ...memberData };

            // Handle Photo Upload if it's a File object (not string)
            if (dataToSave.photoURL && typeof dataToSave.photoURL !== 'string') {
                const file = dataToSave.photoURL;
                // Generate a unique path: directory_photos/[timestamp]_[filename]
                const photoPath = `directory_photos/${Date.now()}_${file.name}`;
                const storageRef = ref(storage, photoPath);

                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                dataToSave.photoURL = downloadURL; // Save URL string to Firestore
            }

            if (!dataToSave.memberId) {
                dataToSave.memberId = generateMemberId(dataToSave.fullName, members);
            }

            // For manual members (not linked to Auth UID), let Firestore gen ID
            await addDoc(collection(db, 'users'), {
                ...dataToSave,
                createdAt: new Date(),
                role: 'guest', // Default role for manual entries
                origin: 'directory_manual'
            });
        } catch (error) {
            console.error("Error adding member:", error);
            throw error;
        }
    };

    const updateMember = async (id, updates) => {
        try {
            const dataToUpdate = { ...updates };
            // Handle Photo Upload if it's a File object
            if (dataToUpdate.photoURL && typeof dataToUpdate.photoURL !== 'string') {
                const file = dataToUpdate.photoURL;
                const photoPath = `directory_photos/${id}_${Date.now()}_${file.name}`;
                const storageRef = ref(storage, photoPath);

                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                dataToUpdate.photoURL = downloadURL;
            }

            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, {
                ...dataToUpdate,
                // Update displayName if fullName changes to keep sync
                ...(dataToUpdate.fullName ? { displayName: dataToUpdate.fullName } : {})
            });
        } catch (error) {
            console.error("Error updating member:", error);
            throw error;
        }
    };

    const deleteMember = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', id));
            // Note: We are not automatically deleting photos from Storage here to avoid complex path tracking,
            // but a cloud function would be ideal for cleanup.
        } catch (error) {
            console.error("Error deleting member:", error);
            throw error;
        }
    };

    const getMember = (id) => members.find(m => m.id === id);

    return (
        <DirectoryContext.Provider value={{
            members,
            addMember,
            updateMember,
            deleteMember,
            getMember,
            loading
        }}>
            {children}
        </DirectoryContext.Provider>
    );
};
