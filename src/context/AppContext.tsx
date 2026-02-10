'use client'

import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../utils/apiService';
import { Candidate } from '@/lib/types';

interface AppContextType {
    candidates: Candidate[];
    addCandidate: (candidate: Candidate) => Promise<string | undefined>;
    isLoadingCandidates: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoadingCandidates] = useState(true);
    // const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
    const addCandidate = async (candidate: Omit<Candidate, 'id' | 'createdAt'>): Promise<string | undefined> => {
        try {
            const newCandidate = await apiService.addCandidate(candidate);
            setCandidates(prev => [...prev, newCandidate]);
            return newCandidate.id;
        } catch (error) {
            console.error('Error adding candidate:', error);
            return undefined;
        }
    };

    return (
        <AppContext.Provider
            value={{
                candidates,
                addCandidate,
                isLoadingCandidates,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
