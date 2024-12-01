import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '@/types/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        try {
            // This is where you'd make your API call
            // For now, let's simulate a successful login
            const mockUser = {
                id: '1',
                email: email,
                name: 'FirstName LastName',
            };

            setUser(mockUser);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

