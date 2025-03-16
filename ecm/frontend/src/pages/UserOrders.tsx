import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Chip,
    Box,
    Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import { API_URL } from '../config/constants';

interface Order {
    id: string;
    status: string;
    total_amount: number;
    shipping_address: string;
    payment_method: string;
    created_at: string;
}

const UserOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

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

    if (orders.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">You haven't placed any orders yet.</Alert>
                <Box mt={2}>
                    <Button variant="contained" color="primary" component={RouterLink} to="/">
                        Start Shopping
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    {order.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status.toUpperCase()}
                                        color={getStatusColor(order.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        component={RouterLink}
                                        to={`/orders/${order.id}`}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserOrders;
