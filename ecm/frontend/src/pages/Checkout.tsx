import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Box,
    Divider,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/constants';

interface CheckoutFormValues {
    shippingAddress: string;
    paymentMethod: string;
}

const validationSchema = Yup.object({
    shippingAddress: Yup.string().required('Shipping address is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
});

const Checkout: React.FC = () => {
    const { cartItems, loading, getCartTotal } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: CheckoutFormValues = {
        shippingAddress: '',
        paymentMethod: 'credit_card',
    };

    const handleSubmit = async (values: CheckoutFormValues) => {
        if (!token) {
            toast.error('You must be logged in to place an order');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/orders`,
                {
                    shipping_address: values.shippingAddress,
                    payment_method: values.paymentMethod,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success('Order placed successfully!');
            navigate(`/orders/${response.data.id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                <Alert severity="info">Your cart is empty. Add items to your cart before checkout.</Alert>
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
                Checkout
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Shipping Information
                        </Typography>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ errors, touched }) => (
                                <Form>
                                    <Box mb={3}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Shipping Address"
                                            name="shippingAddress"
                                            error={touched.shippingAddress && Boolean(errors.shippingAddress)}
                                            helperText={touched.shippingAddress && errors.shippingAddress}
                                        />
                                    </Box>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Payment Method</FormLabel>
                                        <Field as={RadioGroup} name="paymentMethod">
                                            <FormControlLabel
                                                value="credit_card"
                                                control={<Radio />}
                                                label="Credit Card"
                                            />
                                            <FormControlLabel
                                                value="paypal"
                                                control={<Radio />}
                                                label="PayPal"
                                            />
                                            <FormControlLabel
                                                value="bank_transfer"
                                                control={<Radio />}
                                                label="Bank Transfer"
                                            />
                                        </Field>
                                    </FormControl>

                                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/cart')}
                                        >
                                            Back to Cart
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </Box>
                                </Form>
                            )}
                        </Formik>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        {cartItems.map((item) => (
                            <Box key={item.id} sx={{ mb: 2 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={8}>
                                        <Typography variant="body2">
                                            {item.product_name} × {item.quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" align="right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">Total</Typography>
                            <Typography variant="subtitle1">${getCartTotal().toFixed(2)}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Checkout;
