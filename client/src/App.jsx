import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import ShopMenu from './pages/ShopMenu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

// Layout component to include Navbar and Footer
const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes with Navbar */}
                        <Route element={<MainLayout />}>

                            {/* Redirect root to home */}
                            <Route path="/" element={<Navigate to="/home" replace />} />

                            {/* USER Routes */}
                            <Route path="/home" element={
                                <ProtectedRoute allowedRoles={['USER', 'SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <Home />
                                </ProtectedRoute>
                            } />
                            <Route path="/shop/:shopId" element={
                                <ProtectedRoute allowedRoles={['USER', 'SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <ShopMenu />
                                </ProtectedRoute>
                            } />
                            <Route path="/cart" element={
                                <ProtectedRoute allowedRoles={['USER', 'SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <Cart />
                                </ProtectedRoute>
                            } />
                            <Route path="/checkout" element={
                                <ProtectedRoute allowedRoles={['USER', 'SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <Checkout />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders" element={
                                <ProtectedRoute allowedRoles={['USER', 'SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <Orders />
                                </ProtectedRoute>
                            } />

                            {/* ADMIN Routes */}
                            <Route path="/admin" element={
                                <ProtectedRoute allowedRoles={['SHOP_ADMIN', 'SUPER_ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />

                            {/* SUPER ADMIN Routes */}
                            <Route path="/superadmin" element={
                                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                                    <SuperAdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Route>

                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
