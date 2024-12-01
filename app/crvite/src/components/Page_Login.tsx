// src/components/LoginPage.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, isAuthenticated } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    // If already logged in, redirect to main app
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
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
            </form>
        </div>
    );
}

export default LoginPage;