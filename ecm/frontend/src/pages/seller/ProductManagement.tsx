import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    InputAdornment,
    Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/constants';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    shop_id: string;
    category_id: string;
    image_url: string;
}

interface Shop {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

const ProductManagement: React.FC = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const shopIdFromQuery = query.get('shop_id');

    const [products, setProducts] = useState<Product[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedShop, setSelectedShop] = useState<string>(shopIdFromQuery || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        shop_id: '',
        category_id: '',
        image_url: '',
    });
    const { token } = useAuth();

    useEffect(() => {
        fetchShops();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedShop) {
            fetchProducts();
        }
    }, [selectedShop]);

    const fetchShops = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/shops`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShops(response.data);

            // Set the first shop if no shop is selected and no shop ID in query
            if (!selectedShop && !shopIdFromQuery && response.data.length > 0) {
                setSelectedShop(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
            setError('Failed to load shops');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        if (!token || !selectedShop) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/shops/${selectedShop}/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleShopChange = (event: SelectChangeEvent) => {
        setSelectedShop(event.target.value);
    };

    const handleOpenDialog = (product: Product | null = null) => {
        setCurrentProduct(product);
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stock_quantity: product.stock_quantity,
                shop_id: product.shop_id,
                category_id: product.category_id,
                image_url: product.image_url || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                stock_quantity: 0,
                shop_id: selectedShop,
                category_id: categories.length > 0 ? categories[0].id : '',
                image_url: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentProduct(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'price' || name === 'stock_quantity' ? Number(value) : value,
        });
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const handleSubmit = async () => {
        if (!token) return;

        try {
            if (currentProduct) {
                // Update existing product
                await axios.put(
                    `${API_URL}/products/${currentProduct.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Product updated successfully');
            } else {
                // Create new product
                await axios.post(
                    `${API_URL}/products`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Product created successfully');
            }
            handleCloseDialog();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(currentProduct ? 'Failed to update product' : 'Failed to create product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!token) return;

        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    if (!shops.length) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">
                    You don't have any shops yet. Please create a shop first.
                </Alert>
                <Box mt={2}>
                    <Button variant="contained" color="primary" href="/seller/shops">
                        Create Shop
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Manage Products
                </Typography>
                {shops.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Shop</InputLabel>
                        <Select
                            value={selectedShop}
                            onChange={handleShopChange}
                            label="Select Shop"
                        >
                            {shops.map((shop) => (
                                <MenuItem key={shop.id} value={shop.id}>
                                    {shop.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {selectedShop && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Product
                        </Button>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : products.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body1" paragraph>
                                No products found for this shop.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                            >
                                Add Your First Product
                            </Button>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Stock</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                {product.image_url ? (
                                                    <Box
                                                        component="img"
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        sx={{ width: 50, height: 50, objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            bgcolor: 'grey.200',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        No Image
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>${product.price.toFixed(2)}</TableCell>
                                            <TableCell>{product.stock_quantity}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(product)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteProduct(product.id)}
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
                </>
            )}

            {/* Create/Edit Product Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="name"
                                label="Product Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                name="price"
                                label="Price"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={formData.price}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                name="stock_quantity"
                                label="Stock Quantity"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={formData.stock_quantity}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleSelectChange}
                                    label="Category"
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="image_url"
                                label="Image URL"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                helperText="Enter the URL of the product image"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {currentProduct ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductManagement;
