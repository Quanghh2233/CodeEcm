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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import { API_URL } from '../../config/constants';

interface Shop {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

const ShopManagement: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [owners, setOwners] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchShops();
    }, [token]);

    const fetchShops = async () => {
        if (!token) return;

        setLoading(true);
        try {
            console.log("Fetching shops from:", `${API_URL}/shops`);
            console.log("Using token:", token.substring(0, 15) + "...");

            const response = await axios.get(`${API_URL}/shops`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setShops(response.data);

                // Fetch owner details for each shop
                const owners: Record<string, User> = {};
                for (const shop of response.data) {
                    try {
                        const userResponse = await axios.get(`${API_URL}/users/${shop.owner_id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        owners[shop.owner_id] = userResponse.data;
                    } catch (userError) {
                        console.error(`Error fetching user ${shop.owner_id}:`, userError);
                        // Continue even if we couldn't get a specific user
                    }
                }
                setOwners(owners);
            } else {
                console.error("Unexpected API response format:", response.data);
                setError('Invalid data format received from server');

                // Fallback to mock data for testing
                useMockData();
            }
        } catch (error: any) {
            console.error('Error fetching shops:', error);
            setError(`Failed to load shops: ${error.message}`);

            // Use mock data for testing when API fails
            useMockData();
        } finally {
            setLoading(false);
        }
    };

    // Add a function to use mock data when API fails
    const useMockData = () => {
        console.log("Using mock shop data");
        const mockShops = [
            {
                id: '1',
                name: 'Tech Store',
                description: 'Selling the latest tech gadgets',
                owner_id: '101',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Fashion Boutique',
                description: 'Trendy fashion for everyone',
                owner_id: '102',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '3',
                name: 'Home Decor',
                description: 'Beautiful items for your home',
                owner_id: '103',
                created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ];

        const mockOwners = {
            '101': { id: '101', username: 'techseller', email: 'tech@example.com', role: 'seller' },
            '102': { id: '102', username: 'fashionseller', email: 'fashion@example.com', role: 'seller' },
            '103': { id: '103', username: 'homeseller', email: 'home@example.com', role: 'seller' },
        };

        setShops(mockShops);
        setOwners(mockOwners);
    };

    const handleViewShop = (shop: Shop) => {
        setSelectedShop(shop);
        setOpenViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setSelectedShop(null);
    };

    const handleDeleteClick = (shop: Shop) => {
        setSelectedShop(shop);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedShop(null);
    };

    const handleDeleteShop = async () => {
        if (!token || !selectedShop) return;

        try {
            await axios.delete(`${API_URL}/shops/${selectedShop.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Shop deleted successfully');
            fetchShops();
            handleCloseDeleteDialog();
        } catch (error) {
            console.error('Error deleting shop:', error);
            toast.error('Failed to delete shop');
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.description && shop.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                <Typography variant="h4">Manage Shops</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/admin')}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search shops by name or description..."
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
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Shop Name</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredShops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No shops found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredShops.map((shop) => (
                                <TableRow key={shop.id}>
                                    <TableCell>{shop.name}</TableCell>
                                    <TableCell>
                                        {owners[shop.owner_id] ? owners[shop.owner_id].username : 'Unknown'}
                                    </TableCell>
                                    <TableCell>{formatDate(shop.created_at)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewShop(shop)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(shop)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Shop Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={handleCloseViewDialog}
                maxWidth="sm"
                fullWidth
            >
                {selectedShop && (
                    <>
                        <DialogTitle>Shop Details</DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Shop Name
                                </Typography>
                                <Typography variant="body1">{selectedShop.name}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {selectedShop.description || 'No description provided'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Owner
                                </Typography>
                                <Typography variant="body1">
                                    {owners[selectedShop.owner_id]
                                        ? `${owners[selectedShop.owner_id].username} (${owners[selectedShop.owner_id].email})`
                                        : 'Unknown owner'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(selectedShop.created_at)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(selectedShop.updated_at)}
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseViewDialog}>Close</Button>
                            <Button
                                color="primary"
                                onClick={() => {
                                    handleCloseViewDialog();
                                    navigate(`/admin/shops/${selectedShop.id}/products`);
                                }}
                            >
                                View Products
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the shop "{selectedShop?.name}"?
                        This will also delete all products associated with this shop.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteShop} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ShopManagement;
