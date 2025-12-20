import { createContext, useContext, useState, useEffect } from 'react';

const DirectoryContext = createContext();

export const useDirectory = () => {
    const context = useContext(DirectoryContext);
    if (!context) {
        throw new Error('useDirectory must be used within a DirectoryProvider');
    }
    return context;
};

export const DirectoryProvider = ({ children }) => {
    const [members, setMembers] = useState(() => {
        const stored = localStorage.getItem('liturgia_directory');
        return stored ? JSON.parse(stored) : [];
    });

    const saveMembers = (newList) => {
        setMembers(newList);
        localStorage.setItem('liturgia_directory', JSON.stringify(newList));
    };

    const generateMemberId = (fullName, currentList) => {
        if (!fullName) return '';

        // Initials: First letter of each word (up to 3)
        const words = fullName.trim().toUpperCase().split(/\s+/);
        const initials = words.slice(0, 3).map(w => w[0]).join('');
        const prefix = `IACG_${initials}`;

        // Find consecutive number
        const matchingIds = currentList
            .filter(m => m.memberId && m.memberId.startsWith(prefix))
            .map(m => {
                const parts = m.memberId.split('_');
                return parseInt(parts[parts.length - 1]) || 0;
            });

        const nextNum = (matchingIds.length > 0 ? Math.max(...matchingIds) : 0) + 1;
        const paddedNum = nextNum.toString().padStart(3, '0');

        return `${prefix}_${paddedNum}`;
    };

    const addMember = (memberData) => {
        const newMember = { ...memberData };
        if (!newMember.id) newMember.id = crypto.randomUUID();
        if (!newMember.memberId) {
            newMember.memberId = generateMemberId(newMember.fullName, members);
        }

        const newList = [...members, newMember];
        saveMembers(newList);
        return newMember;
    };

    const updateMember = (id, updates) => {
        const newList = members.map(m => m.id === id ? { ...m, ...updates } : m);
        saveMembers(newList);
    };

    const deleteMember = (id) => {
        const newList = members.filter(m => m.id !== id);
        saveMembers(newList);
    };

    const getMember = (id) => members.find(m => m.id === id);

    return (
        <DirectoryContext.Provider value={{
            members,
            addMember,
            updateMember,
            deleteMember,
            getMember
        }}>
            {children}
        </DirectoryContext.Provider>
    );
};
