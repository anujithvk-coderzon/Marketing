'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (accessToken: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoading(false);
                return;
            }
            const { data } = await api.get('/me');
            setUser(data.user);
        } catch {
            localStorage.removeItem('accessToken');
            document.cookie = 'client_token=; path=/; max-age=0';
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (accessToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        document.cookie = 'client_token=1; path=/; max-age=604800';
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        document.cookie = 'client_token=; path=/; max-age=0';
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
