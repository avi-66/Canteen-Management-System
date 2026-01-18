import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Menu, X, ShoppingCart, User, LogOut, UtensilsCrossed, ClipboardList } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';
    };

    // Build nav links based on user role
    const navLinks = [];

    if (user && user.role === 'SHOP_ADMIN') {
        // Shop admins don't see any nav links (they use side navigation)
        // navLinks stays empty
    } else if (user && user.role === 'SUPER_ADMIN') {
        // Super admins only see Dashboard
        navLinks.push({ path: '/superadmin', label: 'Dashboard', icon: <User className="w-5 h-5" /> });
    } else {
        // Regular users see Browse Shops and My Orders
        navLinks.push({ path: '/home', label: 'Browse Shops', icon: <UtensilsCrossed className="w-5 h-5" /> });
        navLinks.push({ path: '/orders', label: 'My Orders', icon: <ClipboardList className="w-5 h-5" /> });
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">CampusEats</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {isAuthenticated && navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${isActive(link.path)}`}
                            >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Cart Button - hidden for shop admins */}
                                {user?.role !== 'SHOP_ADMIN' && (
                                    <Link
                                        to="/cart"
                                        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <ShoppingCart className="w-6 h-6" />
                                        {getCartCount() > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                                {getCartCount()}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* User Profile / Logout */}
                                <div className="hidden md:flex items-center ml-2 border-l pl-4 border-gray-200 space-x-3">
                                    <div className="flex flex-col items-end mr-2">
                                        <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                                        <span className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && isAuthenticated && (
                <div className="md:hidden border-t border-gray-100 bg-gray-50">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <div className="px-4 py-3 border-b border-gray-200 mb-2">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${location.pathname === link.path
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="mr-3">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}

                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
