import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    LayoutDashboard,
    Store,
    Utensils,
    ClipboardList,
    LogOut,
    Menu,
    X,
    DollarSign,
    Package,
    AlertCircle,
    ChevronDown,
    Plus,
    Eye,
    ShoppingBag,
    TrendingUp,
    Clock
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShopStatusToggle from '../components/admin/ShopStatusToggle';
import MenuManagement from './admin/MenuManagement';
import OrderManagement from './admin/OrderManagement';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Layout State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'shop-status' | 'menu' | 'orders'

    // Data State
    const [shops, setShops] = useState([]);
    const [selectedShopId, setSelectedShopId] = useState(null);
    const [currentShop, setCurrentShop] = useState(null);
    const [stats, setStats] = useState({
        ordersToday: 0,
        revenueToday: 0,
        pendingOrders: 0,
        outOfStockItems: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (user?.role === 'SUPER_ADMIN') {
                    // Fetch all shops for Super Admin
                    try {
                        const res = await api.get('/admin/shops');
                        if (res.data.success) {
                            setShops(res.data.data);
                            if (res.data.data.length > 0) {
                                setSelectedShopId(res.data.data[0]._id || res.data.data[0].id);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to fetch shops:", err);
                    }
                } else if (user?.role === 'SHOP_ADMIN') {
                    // Regular Admin: Get assigned shop
                    const res = await api.get('/admin/my-shop');
                    if (res.data.success && res.data.shop) {
                        const shop = res.data.shop;
                        setShops([shop]);
                        // Ensure we use the correct ID property (API usually returns _id from Mongo, or id if transformed)
                        // Checking both for robustness based on previous responses showing 'id' in JSONs
                        const sId = shop._id || shop.id;
                        setSelectedShopId(sId);
                        setCurrentShop(shop);
                    } else {
                        setError("No shop assigned to your account");
                    }
                } else {
                    setError("Unauthorized access");
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
                if (err.response?.status === 404) {
                    setError("No shop assigned to your account");
                } else {
                    setError("Failed to load dashboard data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchInitialData();
        }
    }, [user]);

    // Fetch Stats when shop changes
    useEffect(() => {
        const fetchStatsAndShopDetails = async () => {
            if (!selectedShopId) return;

            try {
                // Fetch stats
                const res = await api.get(`/admin/shop/${selectedShopId}/stats`);
                if (res.data.success) {
                    setStats(res.data.data);
                }

                // If Super Admin, fetch specific shop details for currentShop state (status etc)
                // If Shop Admin, we already set currentShop in initial fetch, but refreshing is good practice
                const shopRes = await api.get(`/admin/shops/${selectedShopId}`);
                if (shopRes.data.success) {
                    setCurrentShop(shopRes.data.data);
                }

            } catch (err) {
                console.error("Failed to fetch stats/details:", err);
            }
        };

        fetchStatsAndShopDetails();
    }, [selectedShopId]);

    const handleShopUpdate = (updatedShop) => {
        setCurrentShop(updatedShop);
        // Also update in shops list if needed
        setShops(prev => prev.map(s => (s.id === updatedShop.id || s._id === updatedShop.id) ? updatedShop : s));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) return <LoadingSpinner />;

    // Guardrail: No shop assigned
    if (!isLoading && !selectedShopId && !error && user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Shop Assigned</h2>
                    <p className="text-gray-600 mb-6">Please contact a Super Admin to assign a shop to your account.</p>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={handleLogout} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'shop-status', name: 'Shop Status', icon: Store },
        { id: 'menu', name: 'Menu Management', icon: Utensils },
        { id: 'orders', name: 'Orders', icon: ShoppingBag },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'shop-status':
                return (
                    <div className="p-6 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop Status Management</h2>
                        {currentShop && (
                            <ShopStatusToggle
                                shop={currentShop}
                                pendingOrders={stats.pendingOrders}
                                onUpdate={handleShopUpdate}
                            />
                        )}
                    </div>
                );
            case 'menu':
                // MenuManagement has its own layout, so we might want to wrap it or let it handle itself
                // Our MenuManagement component has a full page layout. We can just render it.
                // However, MenuManagement expects to be a page. Let's see if we can just render it inside our main area.
                // It has padding and min-h-screen. We might want to adjust passing a prop or wrapper.
                // For now, let's render it directly. It fetches its own data.
                return <MenuManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'dashboard':
            default:
                return (
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                            <p className="text-gray-500">Welcome back, here's what's happening in your canteen today.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Orders Today"
                                value={stats.ordersToday}
                                icon={ShoppingBag}
                                color="blue"
                            />
                            <StatCard
                                title="Revenue Today"
                                value={`₹${stats.revenueToday?.toLocaleString() || 0}`}
                                icon={DollarSign}
                                color="green"
                            />
                            <StatCard
                                title="Pending Orders"
                                value={stats.pendingOrders}
                                icon={Clock}
                                color="orange"
                            />
                            <StatCard
                                title="Out of Stock"
                                value={stats.outOfStockItems}
                                icon={AlertCircle}
                                color="red"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ActionCard
                                    title="Toggle Shop Status"
                                    description={currentShop?.isOpen ? "Shop is Open" : "Shop is Closed"}
                                    icon={Store}
                                    onClick={() => setActiveSection('shop-status')} // Switch tab instead of navigate
                                    variant={currentShop?.isOpen ? 'success' : 'danger'}
                                />
                                <ActionCard
                                    title="Add New Item"
                                    description="Create a new menu item"
                                    icon={Plus}
                                    onClick={() => setActiveSection('menu')} // Switch tab
                                    variant="primary"
                                />
                                <ActionCard
                                    title="View All Orders"
                                    description="Manage current orders"
                                    icon={Eye}
                                    onClick={() => setActiveSection('orders')} // Switch tab
                                    variant="primary"
                                />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-800/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white shadow-xl transform transition-transform duration-200 ease-in-out
                md:relative md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Utensils className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">CanteenAdmin</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false); // Close mobile menu on select
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                    ${activeSection === item.id
                                        ? 'bg-blue-600 text-white font-medium shadow-md'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                                `}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </button>
                        ))}
                    </nav>

                    {/* Footer / User Info */}
                    <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto md:ml-0">
                        {/* Shop Selector for Super Admin */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm"
                                    value={selectedShopId || ''}
                                    onChange={(e) => setSelectedShopId(e.target.value)}
                                >
                                    {shops.map(shop => (
                                        <option key={shop._id || shop.id} value={shop._id || shop.id}>{shop.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        )}

                        {/* Shop Status Indicator */}
                        {currentShop && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${currentShop.isOpen
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${currentShop.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                                {currentShop.isOpen ? 'Open' : 'Closed'}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="h-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ title, description, icon: Icon, onClick, variant }) => {
    const variants = {
        primary: 'hover:border-blue-500 hover:ring-1 hover:ring-blue-500',
        success: 'hover:border-green-500 hover:ring-1 hover:ring-green-500',
        danger: 'hover:border-red-500 hover:ring-1 hover:ring-red-500',
    };

    const iconColors = {
        primary: 'bg-blue-50 text-blue-600',
        success: 'bg-green-50 text-green-600',
        danger: 'bg-red-50 text-red-600',
    }

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 
                transition-all text-left w-full
                ${variants[variant] || variants.primary}
            `}
        >
            <div className={`p-3 rounded-lg mb-4 ${iconColors[variant] || 'bg-gray-50 text-gray-700'}`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </button>
    );
};

export default AdminDashboard;
