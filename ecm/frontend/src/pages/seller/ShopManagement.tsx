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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Box,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
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

const ShopManagement: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentShop, setCurrentShop] = useState<Shop | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchShops();
    }, [token]);

    const fetchShops = async () => {
        if (!token) {
            console.log("No token available");
            return;
        }
        setLoading(true);
        try {
            console.log("Fetching shops...");
            const response = await axios.get(`${API_URL}/shops`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Shops fetched:", response.data);
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching shops:', error);
            setError('Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (shop: Shop | null = null) => {
        console.log("Opening dialog for shop:", shop);
        setCurrentShop(shop);
        if (shop) {
            setFormData({
                name: shop.name,
                description: shop.description || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        console.log("Closing dialog");
        setOpenDialog(false);
        setCurrentShop(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        if (!token) {
            toast.error("You must be logged in");
            return;
        }

        console.log("Submitting shop data:", formData);

        try {
            if (currentShop) {
                // Update existing shop
                await axios.put(
                    `${API_URL}/shops/${currentShop.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Shop updated successfully');
            } else {
                // Create new shop
                await axios.post(
                    `${API_URL}/shops`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Shop created successfully');
            }
            handleCloseDialog();
            fetchShops();
        } catch (error: any) {
            console.error('Error saving shop:', error);
            const errorMsg = error.response?.data?.error ||
                (currentShop ? 'Failed to update shop' : 'Failed to create shop');
            toast.error(errorMsg);
        }
    };

    const handleDeleteShop = async (id: string) => {
        if (!token) return;

        if (window.confirm('Are you sure you want to delete this shop? All products will be deleted as well.')) {
            try {
                await axios.delete(`${API_URL}/shops/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Shop deleted successfully');
                fetchShops();
            } catch (error) {
                console.error('Error deleting shop:', error);
                toast.error('Failed to delete shop');
            }
        }
    };

    const goToProducts = (shopId: string) => {
        navigate(`/seller/products?shop_id=${shopId}`);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Manage Shops</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null)}
                >
                    Create Shop
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : shops.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" paragraph>
                        You don't have any shops yet.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog(null)}
                    >
                        Create Your First Shop
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shops.map((shop) => (
                                <TableRow key={shop.id}>
                                    <TableCell>{shop.name}</TableCell>
                                    <TableCell>{shop.description}</TableCell>
                                    <TableCell>{formatDate(shop.created_at)}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1 }}
                                            onClick={() => goToProducts(shop.id)}
                                        >
                                            Manage Products
                                        </Button>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => handleOpenDialog(shop)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteShop(shop.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Shop Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {currentShop ? 'Edit Shop' : 'Create New Shop'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Shop Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {currentShop ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ShopManagement;
