import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Box,
    Divider,
    IconButton,
    TextField,
    Avatar,
    CircularProgress,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/formatters';

const Cart: React.FC = () => {
    const { cartItems, loading, updateCartItem, removeFromCart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity > 0) {
            updateCartItem(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">Your cart is empty. Start shopping to add items to your cart.</Alert>
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                        Browse Products
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Your Shopping Cart
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        {cartItems.map((item) => (
                            <Box key={item.id} sx={{ mb: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={2}>
                                        <Avatar
                                            src={item.image_url || 'https://via.placeholder.com/150'}
                                            alt={item.product_name}
                                            variant="square"
                                            sx={{ width: 60, height: 60 }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {item.product_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Price: ${item.price.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label="Qty"
                                            type="number"
                                            size="small"
                                            value={item.quantity}
                                            InputProps={{ inputProps: { min: 1 } }}
                                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <IconButton onClick={() => removeFromCart(item.product_id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button variant="outlined" color="error" onClick={clearCart}>
                                Clear Cart
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/')}>
                                Continue Shopping
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal</Typography>
                            <Typography>${getCartTotal().toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Shipping</Typography>
                            <Typography>Free</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6">${getCartTotal().toFixed(2)}</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleCheckout}
                            size="large"
                        >
                            Proceed to Checkout
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;
