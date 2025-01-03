import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LOGO_PLACEHOLDER } from '@/constants/constants';
import { Button } from './ui/button';
import { Input } from './ui/input';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login, isAuthenticated } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            console.log('Error occurred while logging in');
        }
    }

    // If already logged in, redirect to main app
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#08010C]">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className='flex flex-row items-center m-1'>
                    <img src={LOGO_PLACEHOLDER} className="w-[50px] h-[50px]"></img>
                    <div className='p-2'>RAGbase</div>
                </div>
                <div className='m-1'>Log in to your database</div>
                <form
                    onSubmit={handleLogin}>
                    <Input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email"
                        className='bg-gray-200 m-1'>
                    </Input>
                    <Input
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                        className='bg-gray-200 m-1'>
                    </Input>
                    <Button
                        className='bg-purple-500 text-white m-1'>Log In</Button>
                </form>
            </div>
        </div>

    );
}

export default LoginPage;