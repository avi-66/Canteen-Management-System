import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, AlertCircle, Mail, Lock, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isAuthenticated, user, loading } = useAuth();

    // UI State
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const urlError = searchParams.get('error');
    const token = searchParams.get('token');

    useEffect(() => {
        if (isAuthenticated && !loading && user) {
            if (user.role === 'SHOP_ADMIN') {
                navigate('/admin');
            } else if (user.role === 'SUPER_ADMIN') {
                navigate('/superadmin');
            } else {
                navigate('/home');
            }
        }
    }, [isAuthenticated, loading, user, navigate]);

    useEffect(() => {
        if (token) {
            login(token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [token, login]);

    useEffect(() => {
        if (urlError === 'auth_failed') {
            setAuthError('Google authentication failed. Please try again.');
        } else if (urlError === 'server_error') {
            setAuthError('Server error during authentication.');
        }
    }, [urlError]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (authError) setAuthError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError(null);

        try {
            const endpoint = isRegistering ? '/auth/register' : '/auth/login';
            const payload = isRegistering
                ? { name: formData.name, email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password };

            const response = await api.post(endpoint, payload);

            if (response.data.success) {
                login(response.data.token);
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            setAuthError(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'https://canteen-management-system-2-b9q6.onrender.com/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 animate-fade-in">

                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
                        <Utensils className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500">
                        {isRegistering ? 'Sign up to start ordering' : 'Login to your account'}
                    </p>
                </div>

                {/* Error Message */}
                {authError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm animate-pulse-once">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required={isRegistering}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            isRegistering ? 'Sign Up' : 'Login'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                {/* Login/Register Toggle */}
                <p className="text-center text-gray-600">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setAuthError(null);
                            setFormData({ name: '', email: '', password: '' });
                        }}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {isRegistering ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
