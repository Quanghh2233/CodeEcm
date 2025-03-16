import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from '././App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from '././contexts/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <CartProvider>
                    <App />
                    <ToastContainer position="bottom-right" />
                </CartProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
