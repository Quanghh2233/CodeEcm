import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Grid,
    Typography,
    Button,
    Box,
    Card,
    CardMedia,
    Divider,
    TextField,
    Skeleton,
    Alert,
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { API_URL } from '../config/constants';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    shop_id: string;
    category_id: string;
    image_url: string;
    created_at: string;
    updated_at: string;
}

interface Shop {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/products/${id}`);
                setProduct(response.data);

                // Fetch shop details
                const shopResponse = await axios.get(`${API_URL}/shops/${response.data.shop_id}`);
                setShop(shopResponse.data);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setError('Failed to load product details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(event.target.value);
        if (isNaN(newQuantity) || newQuantity < 1) {
            setQuantity(1);
        } else if (product && newQuantity > product.stock_quantity) {
            setQuantity(product.stock_quantity);
        } else {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product.id, quantity);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="text" height={80} />
                        <Skeleton variant="text" height={30} />
                        <Skeleton variant="text" height={200} />
                        <Skeleton variant="rectangular" height={60} />
                    </Grid>
                </Grid>
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

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">Product not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="400"
                            image={product.image_url || 'https://via.placeholder.com/400'}
                            alt={product.name}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        {product.name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                        ${product.price.toFixed(2)}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1" paragraph>
                        {product.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Available: {product.stock_quantity} items
                    </Typography>
                    {shop && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Sold by: {shop.name}
                        </Typography>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            InputProps={{ inputProps: { min: 1, max: product.stock_quantity } }}
                            sx={{ width: 100, mr: 2 }}
                            disabled={product.stock_quantity < 1}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity < 1}
                            size="large"
                        >
                            {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetails;
