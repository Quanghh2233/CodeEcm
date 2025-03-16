import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentUser();
    }, [token]);

    const login = async (username: string, password: string) => {
        const response = await axios.post(`${API_URL}/users/login`, {
            username,
            password,
        });

        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        setUser(user);
    };

    const register = async (username: string, email: string, password: string) => {
        await axios.post(`${API_URL}/users`, {
            username,
            email,
            password,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateRole = async (role: string) => {
        try {
            const response = await axios.patch(
                `${API_URL}/users/role`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(response.data);
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!token,
                isLoading,
                token,
                login,
                register,
                logout,
                updateRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
