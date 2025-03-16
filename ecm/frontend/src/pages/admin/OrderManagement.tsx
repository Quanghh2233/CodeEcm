import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    IconButton,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Grid, // Added missing Grid import
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { API_URL } from '../../config/constants';

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
    items?: OrderItem[];
}

interface User {
    id: string;
    username: string;
    email: string;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        if (!token) return;

        setLoading(true);
        try {
            // In a real implementation, you would have an API endpoint like this
            const response = await axios.get(`${API_URL}/orders/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(response.data);

            // Fetch user details for each order
            const userMap: Record<string, User> = {};

            // Use an object to track unique user IDs instead of a Set
            const uniqueUserIdsObj: Record<string, boolean> = {};
            response.data.forEach((order: Order) => {
                uniqueUserIdsObj[order.user_id] = true;
            });

            // Convert keys to array
            const uniqueUserIds = Object.keys(uniqueUserIdsObj);

            for (const userId of uniqueUserIds) {
                try {
                    const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    userMap[userId] = userResponse.data;
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error);
                }
            }

            setUsers(userMap);
        } catch (error) {
            console.error('Error fetching orders:', error);

            // For now, generate mock data if the endpoint doesn't exist
            const mockOrders = [
                {
                    id: '1',
                    user_id: '3',
                    status: 'pending',
                    total_amount: 99.95,
                    shipping_address: '123 Main St, City, Country',
                    payment_method: 'credit_card',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: '2',
                    user_id: '5',
                    status: 'processing',
                    total_amount: 149.50,
                    shipping_address: '456 Oak Ave, Town, Country',
                    payment_method: 'paypal',
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: '3',
                    user_id: '3',
                    status: 'shipped',
                    total_amount: 79.99,
                    shipping_address: '789 Pine Rd, Village, Country',
                    payment_method: 'credit_card',
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: '4',
                    user_id: '5',
                    status: 'delivered',
                    total_amount: 199.95,
                    shipping_address: '101 Elm St, County, Country',
                    payment_method: 'bank_transfer',
                    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: '5',
                    user_id: '3',
                    status: 'cancelled',
                    total_amount: 59.99,
                    shipping_address: '202 Maple Dr, Valley, Country',
                    payment_method: 'credit_card',
                    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                },
            ];

            const mockUsers = {
                '3': { id: '3', username: 'buyer1', email: 'buyer1@example.com' },
                '5': { id: '5', username: 'buyer2', email: 'buyer2@example.com' },
            };

            setOrders(mockOrders);
            setUsers(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId: string) => {
        if (!token) return null;

        try {
            const response = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching order details for order ${orderId}:`, error);

            // Mock order items if API endpoint doesn't exist
            return {
                items: [
                    {
                        id: '101',
                        product_id: 'p1',
                        product_name: 'Product 1',
                        quantity: 2,
                        price: 19.99,
                        image_url: 'https://via.placeholder.com/50',
                    },
                    {
                        id: '102',
                        product_id: 'p2',
                        product_name: 'Product 2',
                        quantity: 1,
                        price: 59.97,
                        image_url: 'https://via.placeholder.com/50',
                    }
                ]
            };
        }
    };

    const handleViewOrder = async (order: Order) => {
        setSelectedOrder(order);

        // Fetch order details including items
        const orderDetails = await fetchOrderDetails(order.id);
        if (orderDetails && orderDetails.items) {
            setSelectedOrder({
                ...order,
                items: orderDetails.items
            });
        }

        setOpenViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setSelectedOrder(null);
    };

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setSelectedStatus(order.status);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedOrder(null);
        setSelectedStatus('');
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setSelectedStatus(event.target.value);
    };

    const handleStatusFilterChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
    };

    const handleUpdateStatus = async () => {
        if (!token || !selectedOrder) return;

        try {
            await axios.patch(
                `${API_URL}/orders/${selectedOrder.id}/status`,
                { status: selectedStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update the order in the local state
            setOrders(orders.map(order =>
                order.id === selectedOrder.id ? { ...order, status: selectedStatus } : order
            ));

            toast.success('Order status updated successfully');
            handleCloseEditDialog();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

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

    const filteredOrders = orders.filter(order => {
        // Filter by search term
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (users[order.user_id]?.username.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Filter by status
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Manage Orders</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/admin')}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        sx={{ flexGrow: 1 }}
                        variant="outlined"
                        placeholder="Search orders by ID or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            label="Status"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id.substring(0, 8)}...</TableCell>
                                    <TableCell>
                                        {users[order.user_id]?.username || 'Unknown'}
                                    </TableCell>
                                    <TableCell>{formatDate(order.created_at)}</TableCell>
                                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status.toUpperCase()}
                                            color={getStatusColor(order.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => handleEditOrder(order)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Order Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={handleCloseViewDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Order ID
                                        </Typography>
                                        <Typography variant="body1">{selectedOrder.id}</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Customer
                                        </Typography>
                                        <Typography variant="body1">
                                            {users[selectedOrder.user_id]?.username || 'Unknown'} ({users[selectedOrder.user_id]?.email || 'No email'})
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedOrder.created_at)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={selectedOrder.status.toUpperCase()}
                                            color={getStatusColor(selectedOrder.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Shipping Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedOrder.shipping_address}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Payment Method
                                        </Typography>
                                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                            {selectedOrder.payment_method.replace(/_/g, ' ')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total Amount
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            ${selectedOrder.total_amount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6">Order Items</Typography>
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <List>
                                            {selectedOrder.items.map((item) => (
                                                <ListItem key={item.id} divider>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={item.image_url || 'https://via.placeholder.com/50'}
                                                            variant="square"
                                                            sx={{ width: 50, height: 50 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={item.product_name}
                                                        secondary={
                                                            <>
                                                                <Typography component="span" variant="body2">
                                                                    ${item.price.toFixed(2)} × {item.quantity}
                                                                </Typography>
                                                            </>
                                                        }
                                                    />
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 80, textAlign: 'right' }}>
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No items found for this order.
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseViewDialog}>Close</Button>
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                    handleCloseViewDialog();
                                    handleEditOrder(selectedOrder);
                                }}
                            >
                                Edit Status
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Edit Status Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                maxWidth="xs"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogContent>
                            <Box sx={{ my: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    Order ID: <strong>{selectedOrder.id.substring(0, 8)}...</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Current Status: <Chip
                                        label={selectedOrder.status.toUpperCase()}
                                        color={getStatusColor(selectedOrder.status) as any}
                                        size="small"
                                    />
                                </Typography>

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>New Status</InputLabel>
                                    <Select
                                        value={selectedStatus}
                                        onChange={handleStatusChange}
                                        label="New Status"
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="processing">Processing</MenuItem>
                                        <MenuItem value="shipped">Shipped</MenuItem>
                                        <MenuItem value="delivered">Delivered</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog}>Cancel</Button>
                            <Button
                                onClick={handleUpdateStatus}
                                color="primary"
                                variant="contained"
                                disabled={selectedStatus === selectedOrder.status}
                            >
                                Update Status
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default OrderManagement;
