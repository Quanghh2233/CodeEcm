import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface PrivateRouteProps {
    element: React.ReactNode;
    requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
        // If specific role is required and user doesn't have it (admin can access all)
        return <Navigate to="/" replace />;
    }

    return <>{element}</>;
};

export default PrivateRoute;
