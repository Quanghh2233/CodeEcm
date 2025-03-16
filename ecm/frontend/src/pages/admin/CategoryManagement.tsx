import React, { useState, useEffect } from 'react';
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

interface Category {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const { token } = useAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category: Category | null = null) => {
        setCurrentCategory(category);
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
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
        setOpenDialog(false);
        setCurrentCategory(null);
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
            toast.error('Authentication required');
            return;
        }

        try {
            if (currentCategory) {
                // Update existing category
                await axios.put(
                    `${API_URL}/categories/${currentCategory.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Category updated successfully');
            } else {
                // Create new category
                await axios.post(
                    `${API_URL}/categories`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success('Category created successfully');
            }
            handleCloseDialog();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(currentCategory ? 'Failed to update category' : 'Failed to create category');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!token) {
            toast.error('Authentication required');
            return;
        }

        if (window.confirm('Are you sure you want to delete this category? This may affect products assigned to it.')) {
            try {
                await axios.delete(`${API_URL}/categories/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Category deleted successfully');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    if (loading && categories.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Manage Categories</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No categories found. Create your first category.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>{formatDate(category.created_at)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => handleOpenDialog(category)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteCategory(category.id)}
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

            {/* Create/Edit Category Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Category Name"
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
                        {currentCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryManagement;
