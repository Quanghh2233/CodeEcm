import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Button,
    Box,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
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
    category_id: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
}

const Home: React.FC = () => {
    const { id: categoryId } = useParams<{ id: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const pageSize = 8;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `${API_URL}/products?page_id=${page}&page_size=${pageSize}`;

                if (categoryId || selectedCategory) {
                    url = `${API_URL}/categories/${categoryId || selectedCategory}/products?page_id=${page}&page_size=${pageSize}`;
                }

                const response = await axios.get(url);
                setProducts(response.data);
                // In a real API, you'd get total pages from response
                setTotalPages(Math.ceil(response.data.length / pageSize) || 1);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, categoryId, selectedCategory]);

    const handleCategoryChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setSelectedCategory(value);
        setPage(1);
        if (value) {
            navigate(`/categories/${value}`);
        } else {
            navigate('/');
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleAddToCart = (productId: string) => {
        addToCart(productId, 1);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        label="Category"
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
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

                    {products.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}

                    {products.length === 0 && (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="h5">No products found</Typography>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default Home;
