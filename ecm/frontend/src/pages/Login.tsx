import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { TextField, Button, Typography, Container, Box, Link, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormValues {
    username: string;
    password: string;
}

const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues: LoginFormValues = {
        username: '',
        password: '',
    };

    const handleSubmit = async (values: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            await login(values.username, values.password);
            toast.success('Login successful');
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                <Typography component="h1" variant="h5" align="center">
                    Login
                </Typography>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <Box mb={2} mt={2}>
                                <Field
                                    as={TextField}
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    error={touched.username && Boolean(errors.username)}
                                    helperText={touched.username && errors.username}
                                />
                            </Box>
                            <Box mb={3}>
                                <Field
                                    as={TextField}
                                    fullWidth
                                    type="password"
                                    label="Password"
                                    name="password"
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                />
                            </Box>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                            <Box mt={2} textAlign="center">
                                <Typography variant="body2">
                                    Don't have an account?{' '}
                                    <Link component={RouterLink} to="/register">
                                        Register
                                    </Link>
                                </Typography>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Container>
    );
};

export default Login;
