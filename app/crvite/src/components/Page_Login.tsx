// src/components/LoginPage.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, register, delete_account, isAuthenticated } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
        }
    };
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(email, password);
        } catch (err) {
            setError('Error occurred while registering user');
        }
    }
    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await delete_account(email, password);
        } catch (err) {
            setError('Error occurred while deleting user');
        }
    }

    // If already logged in, redirect to main app
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                {error && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
                )}
                <div style={{ marginBottom: '15px' }}>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-2 border border-blue-500'
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full p-2 border border-blue-500'
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    className='p-2 border border-blue-500'
                >
                    Login
                </button>
                <button
                    type="button"
                    onClick={handleRegister}
                    className='p-2 border border-blue-500'
                >
                    Register
                </button>
                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className='p-2 border border-blue-500'
                >
                    Delete Account
                </button>
            </form>
        </div>
    );
}

export default LoginPage;