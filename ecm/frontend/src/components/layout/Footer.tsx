import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

const Footer: React.FC = () => {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', py: 6, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            About Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ECM is a modern e-commerce platform with various features for buyers, sellers and admins.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            123 Main Street, City
                            <br />
                            Email: info@ecmstore.com
                            <br />
                            Phone: +1 234 567 8901
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Follow Us
                        </Typography>
                        <Link href="#" color="inherit">
                            <Typography variant="body2" color="text.secondary">
                                Facebook
                            </Typography>
                        </Link>
                        <Link href="#" color="inherit">
                            <Typography variant="body2" color="text.secondary">
                                Twitter
                            </Typography>
                        </Link>
                        <Link href="#" color="inherit">
                            <Typography variant="body2" color="text.secondary">
                                Instagram
                            </Typography>
                        </Link>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'© '}
                        {new Date().getFullYear()}
                        {' ECM Store. All rights reserved.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
