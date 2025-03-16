import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/constants';

interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalShops: number;
    totalOrders: number;
    recentOrders: {
        id: string;
        status: string;
        total_amount: number;
        created_at: string;
    }[];
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!token) return;

            setLoading(true);
            try {
                // This would be replaced by actual API calls to get dashboard stats
                // For now, we'll mock the data
                const mockStats: DashboardStats = {
                    totalUsers: 120,
                    totalProducts: 450,
                    totalShops: 25,
                    totalOrders: 310,
                    recentOrders: [
                        {
                            id: '6d7f5e8a-9c3b-4d2a-8e7f-1a2b3c4d5e6f',
                            status: 'pending',
                            total_amount: 189.95,
                            created_at: new Date().toISOString(),
                        },
                        {
                            id: '7e8f6d9c-5b4a-3e2d-1f2e-3d4e5f6a7b8c',
                            status: 'processing',
                            total_amount: 75.50,
                            created_at: new Date(Date.now() - 3600000).toISOString(),
                        },
                        {
                            id: '8a9b7c6d-5e4f-3d2e-1c2b-3a4b5c6d7e8f',
                            status: 'shipped',
                            total_amount: 230.00,
                            created_at: new Date(Date.now() - 86400000).toISOString(),
                        },
                    ],
                };

                setStats(mockStats);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [token]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PeopleIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Total Users</Typography>
                        </Box>
                        <Typography variant="h3" component="div">
                            {stats?.totalUsers}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ShoppingBasketIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Total Products</Typography>
                        </Box>
                        <Typography variant="h3" component="div">
                            {stats?.totalProducts}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <StoreIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Total Shops</Typography>
                        </Box>
                        <Typography variant="h3" component="div">
                            {stats?.totalShops}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ShoppingBasketIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Total Orders</Typography>
                        </Box>
                        <Typography variant="h3" component="div">
                            {stats?.totalOrders}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Orders
                        </Typography>
                        <List>
                            {stats?.recentOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`Order #${order.id.substring(0, 8)}...`}
                                            secondary={`Status: ${order.status} - $${order.total_amount.toFixed(2)}`}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            component={RouterLink}
                                            to={`/orders/${order.id}`}
                                        >
                                            View
                                        </Button>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Quick Links */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Management
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    component={RouterLink}
                                    to="/admin/categories"
                                    startIcon={<CategoryIcon />}
                                >
                                    Manage Categories
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    component={RouterLink}
                                    to="/admin/users"
                                    startIcon={<PeopleIcon />}
                                >
                                    Manage Users
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    component={RouterLink}
                                    to="/admin/orders"
                                    startIcon={<ShoppingBasketIcon />}
                                >
                                    Manage Orders
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    component={RouterLink}
                                    to="/admin/shops"
                                    startIcon={<StoreIcon />}
                                >
                                    Manage Shops
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
