import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import UserOrders from './pages/UserOrders';
import OrderDetails from './pages/OrderDetails';
import ShopManagement from './pages/seller/ShopManagement';
import ProductManagement from './pages/seller/ProductManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import ShopManagementAdmin from './pages/admin/ShopManagement';
import UserManagementAdmin from './pages/admin/UserManagement';
import OrderManagementAdmin from './pages/admin/OrderManagement';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/common/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import SearchResults from './pages/SearchResults';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

const App: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const isSeller = user?.role === 'seller';
    const isAdmin = user?.role === 'admin';

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/categories/:id" element={<Home />} />

                        {/* Protected routes */}
                        <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
                        <Route path="/checkout" element={<PrivateRoute element={<Checkout />} />} />
                        <Route path="/profile" element={<PrivateRoute element={<UserProfile />} />} />
                        <Route path="/orders" element={<PrivateRoute element={<UserOrders />} />} />
                        <Route path="/orders/:id" element={<PrivateRoute element={<OrderDetails />} />} />

                        {/* Seller routes */}
                        <Route
                            path="/seller/shops"
                            element={
                                <PrivateRoute
                                    element={<ShopManagement />}
                                    requiredRole="seller"
                                />
                            }
                        />
                        <Route
                            path="/seller/products"
                            element={
                                <PrivateRoute
                                    element={<ProductManagement />}
                                    requiredRole="seller"
                                />
                            }
                        />

                        {/* Admin routes */}
                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute
                                    element={<AdminDashboard />}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <PrivateRoute
                                    element={<CategoryManagement />}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/admin/shops"
                            element={
                                <PrivateRoute
                                    element={<ShopManagementAdmin />}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <PrivateRoute
                                    element={<UserManagementAdmin />}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <PrivateRoute
                                    element={<OrderManagementAdmin />}
                                    requiredRole="admin"
                                />
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default App;
