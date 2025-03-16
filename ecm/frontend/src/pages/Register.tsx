import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { TextField, Button, Typography, Container, Box, Link, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username should be at least 3 characters')
    .max(20, 'Username should not exceed 20 characters')
    .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: RegisterFormValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await register(values.username, values.email, values.password);
      toast.success('Registration successful');
      
      // Auto login after registration
      await login(values.username, values.password);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center">
          Register
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
              <Box mb={2}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Box>
              <Box mb={2}>
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
              <Box mb={3}>
                <Field
                  as={TextField}
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
              <Box mt={2} textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login">
                    Login
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

export default Register;