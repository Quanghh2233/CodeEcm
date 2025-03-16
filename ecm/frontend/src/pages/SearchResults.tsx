import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Box,
    Pagination,
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
    image_url: string;
}

const SearchResults: React.FC = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(search).get('query') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const { addToCart } = useCart();
    const pageSize = 8;

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/products/search?query=${encodeURIComponent(query)}&page_id=${page}&page_size=${pageSize}`
                );
                setProducts(response.data);
                setTotalPages(Math.ceil(response.data.length / pageSize) || 1);
            } catch (error) {
                console.error('Error searching products:', error);
                setError('Failed to search products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, page]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleAddToCart = (productId: string) => {
        addToCart(productId, 1);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Search Results for: "{query}"
                </Typography>
                <Grid container spacing={3}>
                    {Array.from(new Array(4)).map((_, index) => (
                        <Grid item key={index} xs={12} sm={6} md={3}>
                            <Card>
                                <Skeleton variant="rectangular" height={140} />
                                <CardContent>
                                    <Skeleton />
                                    <Skeleton width="60%" />
                                </CardContent>
                                <CardActions>
                                    <Skeleton width={120} height={40} />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Search Results for: "{query}"
            </Typography>

            {products.length === 0 ? (
                <Alert severity="info">
                    No products found for "{query}". Try different search terms.
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={3}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={product.image_url || 'https://via.placeholder.com/150'}
                                        alt={product.name}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {product.name}
                                        </Typography>
                                        <Typography color="text.secondary" noWrap>
                                            {product.description}
                                        </Typography>
                                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                            ${product.price.toFixed(2)}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={product.stock_quantity < 1}
                                        >
                                            {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default SearchResults;
