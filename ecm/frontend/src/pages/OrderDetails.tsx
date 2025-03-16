import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    Grid,
    Box,
    Divider,
    Chip,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import { API_URL } from '../config/constants';

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url: string;
}

interface Order {
    id: string;
    user_id: string;
    status: string;
    total_amount: number;
    shipping_address: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!token || !id) return;

            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/orders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order details:', error);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, token]);

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

    if (!order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">Order not found</Alert>
                <Box mt={2}>
                    <Button variant="contained" color="primary" component={RouterLink} to="/orders">
                        Back to Orders
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Order Details
                </Typography>
                <Button variant="outlined" component={RouterLink} to="/orders">
                    Back to Orders
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>
                        <List>
                            {order.items.map((item) => (
                                <ListItem key={item.id} divider>
                                    <ListItemAvatar>
                                        <Avatar
                                            src={item.image_url || 'https://via.placeholder.com/50'}
                                            variant="square"
                                            sx={{ width: 60, height: 60, mr: 2 }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.product_name}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    ${item.price.toFixed(2)} × {item.quantity}
                                                </Typography>
                                                <Box component="span" sx={{ display: 'block' }}>
                                                    Total: ${(item.price * item.quantity).toFixed(2)}
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Order ID:
                            </Typography>
                            <Typography variant="body1">{order.id}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Date:
                            </Typography>
                            <Typography variant="body1">{formatDate(order.created_at)}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Status:
                            </Typography>
                            <Chip
                                label={order.status.toUpperCase()}
                                color={getStatusColor(order.status) as any}
                                size="small"
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Payment Method:
                            </Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {order.payment_method.replace(/_/g, ' ')}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Shipping Address:
                            </Typography>
                            <Typography variant="body1">{order.shipping_address}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Total
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="bold">
                                ${order.total_amount.toFixed(2)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default OrderDetails;
