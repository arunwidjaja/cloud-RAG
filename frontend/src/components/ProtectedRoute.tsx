// src/components/ProtectedRoute.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/landing', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Don't render children at all if not authenticated
    return isAuthenticated ? <>{children}</> : null;
}