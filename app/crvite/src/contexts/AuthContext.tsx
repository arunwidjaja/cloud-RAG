import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '@/types/types';

import { start_login, start_register, start_delete_account, start_logout } from '@/api/api';

import { initializeApi } from '@/api/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const createUser = (id: string, email: string): User => {
    const user: User = {
        id: id,
        email: email,

    };
    return user
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        try {
            const user_id = await start_login(email, password);
            if (user_id) {
                const user = createUser(user_id, email)
                setUser(user);
                initializeApi(user_id)
            } else {
                alert("The email or password are incorrect. Please try again.")
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async(email: string, password: string): Promise<boolean> => {
        try {
            const success = await start_register(email, password);
            if (success) {
                return true
            } else {
                alert("An error occurred while registering your account.")
                return false
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

    const logout = async() => {
        setUser(null);
        try {
            await start_logout();
        } catch (error) {
            console.error('Error loggging out: ', error);
            throw error;
        }
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

