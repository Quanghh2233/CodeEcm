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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/constants';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const { token, user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        if (!token) return;

        setLoading(true);
        try {
            // In a real implementation, you would have an API endpoint like this
            const response = await axios.get(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);

            // For now, generate mock data if the endpoint doesn't exist
            const mockUsers = [
                { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString() },
                { id: '2', username: 'seller1', email: 'seller1@example.com', role: 'seller', created_at: new Date().toISOString() },
                { id: '3', username: 'buyer1', email: 'buyer1@example.com', role: 'buyer', created_at: new Date().toISOString() },
                { id: '4', username: 'seller2', email: 'seller2@example.com', role: 'seller', created_at: new Date().toISOString() },
                { id: '5', username: 'buyer2', email: 'buyer2@example.com', role: 'buyer', created_at: new Date().toISOString() },
            ];
            setUsers(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    const handleRoleChange = (event: SelectChangeEvent) => {
        setSelectedRole(event.target.value);
    };

    const handleUpdateRole = async () => {
        if (!token || !selectedUser) return;

        try {
            await axios.patch(
                `${API_URL}/users/${selectedUser.id}/role`,
                { role: selectedRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('User role updated successfully');

            // Update the user in the local state
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, role: selectedRole } : user
            ));

            handleCloseEditDialog();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (!token || !selectedUser) return;

        try {
            await axios.delete(`${API_URL}/users/${selectedUser.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('User deleted successfully');
            setUsers(users.filter(user => user.id !== selectedUser.id));
            handleCloseDeleteDialog();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const getRoleChipColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'seller':
                return 'primary';
            case 'buyer':
                return 'success';
            default:
                return 'default';
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Typography variant="h4">Manage Users</Typography>
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
                    placeholder="Search users by username or email..."
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
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role.toUpperCase()}
                                            color={getRoleChipColor(user.role) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditClick(user)}
                                            disabled={user.id === currentUser?.id} // Disable for current user
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                            disabled={user.id === currentUser?.id} // Disable for current user
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

            {/* Edit Role Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                maxWidth="xs"
                fullWidth
            >
                {selectedUser && (
                    <>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogContent>
                            <Box sx={{ my: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    Username: <strong>{selectedUser.username}</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Email: <strong>{selectedUser.email}</strong>
                                </Typography>

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={selectedRole}
                                        onChange={handleRoleChange}
                                        label="Role"
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="seller">Seller</MenuItem>
                                        <MenuItem value="buyer">Buyer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog}>Cancel</Button>
                            <Button
                                onClick={handleUpdateRole}
                                color="primary"
                                disabled={selectedRole === selectedUser.role}
                            >
                                Update
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
                        Are you sure you want to delete the user "{selectedUser?.username}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteUser} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
