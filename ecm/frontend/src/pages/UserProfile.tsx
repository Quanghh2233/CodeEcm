import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Grid,
    Box,
    Button,
    FormControl,
    FormLabel,
    FormControlLabel,
    Radio,
    RadioGroup,
    Divider,
    Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
    const { user, logout, updateRole } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string>(user?.role || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRole(event.target.value);
    };

    const handleRoleSubmit = async () => {
        if (selectedRole === user?.role) {
            toast.info('You already have this role');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateRole(selectedRole);
            toast.success(`Your role has been updated to ${selectedRole}`);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">Please login to view your profile</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6">Account Information</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1">
                                <strong>Username:</strong> {user.username}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Current Role:</strong> {user.role}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Change Role
                        </Typography>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select Role</FormLabel>
                            <RadioGroup
                                name="role"
                                value={selectedRole}
                                onChange={handleRoleChange}
                            >
                                <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
                                <FormControlLabel value="seller" control={<Radio />} label="Seller" />
                            </RadioGroup>
                        </FormControl>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleRoleSubmit}
                                disabled={isSubmitting || selectedRole === user.role}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Role'}
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate('/orders')}
                            >
                                View My Orders
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default UserProfile;
