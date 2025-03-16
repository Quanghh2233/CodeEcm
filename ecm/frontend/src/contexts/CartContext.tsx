import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url: string;
    created_at: string;
    updated_at: string;
}

interface CartContextType {
    cartItems: CartItem[];
    loading: boolean;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateCartItem: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { isAuthenticated, token } = useAuth();

    const fetchCart = async () => {
        if (!isAuthenticated || !token) {
            setCartItems([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated, token]);

    const addToCart = async (productId: string, quantity: number) => {
        if (!isAuthenticated || !token) {
            toast.error('Please login to add items to cart');
            return;
        }

        try {
            await axios.post(
                `${API_URL}/cart`,
                { product_id: productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Product added to cart');
            fetchCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        }
    };

    const updateCartItem = async (productId: string, quantity: number) => {
        if (!isAuthenticated || !token) {
            return;
        }

        try {
            await axios.put(
                `${API_URL}/cart`,
                { product_id: productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchCart();
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!isAuthenticated || !token) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/cart/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Item removed from cart');
            fetchCart();
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item from cart');
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated || !token) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems([]);
            toast.success('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                addToCart,
                updateCartItem,
                removeFromCart,
                clearCart,
                getCartTotal,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
