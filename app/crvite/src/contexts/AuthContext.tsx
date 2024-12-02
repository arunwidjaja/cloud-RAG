import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '@/types/types';

import { start_login, start_register, start_delete_account } from '@/api/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const createUser = (email: string): User => {
    // TODO: implement logic for id and name
    const user: User = {
        email: email,
    };
    return user
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        try {
            const success = await start_login(email, password);
            if (success) {
                const user = createUser(email)
                setUser(user);
            } else {
                alert("The username or password are incorrect. Please try again.")
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async(email: string, password: string) => {
        try {
            const success = await start_register(email, password);
            if (success) {
                const user = createUser(email)
                setUser(user)
            } else {
                alert("This username already exists. Please choose a different one.")
            }
        } catch (error) {
            console.error('Registration error: ', error);
            throw error;
        }
    };

    const delete_account = async(email: string, password: string) => {
        try {
            const success = await start_delete_account(email, password);
            if (success) {
                alert("Deleted account: " + email)
            } else {
                alert("Could not delete that account. Please try again.")
            }
        } catch (error) {
            console.error('Error deleting account: ', error);
            throw error;
        }
    }

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                delete_account,
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

