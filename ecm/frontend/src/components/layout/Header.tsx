import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    sx={{ textDecoration: 'none', flexGrow: 1 }}
                >
                    ECM Store
                </Typography>

                <form onSubmit={handleSearch}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Search>
                </form>

                {isAuthenticated ? (
                    <>
                        <IconButton
                            color="inherit"
                            component={RouterLink}
                            to="/cart"
                            aria-label="cart"
                        >
                            <Badge badgeContent={cartItems.length} color="secondary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>

                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
                                My Orders
                            </MenuItem>

                            {(user?.role === 'seller' || user?.role === 'admin') && (
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/seller/shops'); }}>
                                    My Shops
                                </MenuItem>
                            )}

                            {user?.role === 'admin' && (
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                                    Admin Dashboard
                                </MenuItem>
                            )}

                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={RouterLink} to="/login">
                            Login
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/register">
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
