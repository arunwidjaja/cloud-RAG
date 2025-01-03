// src/components/LoginPage.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LOGO_PLACEHOLDER } from '@/constants/constants';
import { Input } from './ui/input';
import { Button } from './ui/button';
import OneTimePasscode from './OneTimePasscode';
function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOTP, setShowOTP] = useState(false);

    const { register, isAuthenticated } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        else {
            try {
                const success = await register(email, password);
                if(success) {
                    setShowOTP(true);
                }
            } catch (err) {
                console.log('Error occurred while registering user');
            }
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
                <div className='m-1'>Register to set up your database</div>
                <form
                    onSubmit={handleRegister}>
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
                    <Input
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="re-enter password"
                        className='bg-gray-200 m-1'>
                    </Input>
                    <Button
                        className='bg-purple-500 text-white m-1'>Create Account</Button>
                </form>
                {showOTP && <OneTimePasscode email={email}></OneTimePasscode>}
            </div>

        </div>

    );
}

export default RegisterPage;