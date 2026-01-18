import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    LayoutDashboard,
    Store,
    Users,
    ShoppingBag,
    LogOut,
    Menu,
    ChevronDown,
    Plus,
    X,
    Search,
    TrendingUp,
    DollarSign,
    Clock,
    AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OrderManagement from './admin/OrderManagement';
import ManageShops from './superadmin/ManageShops';
import AllUsers from './superadmin/AllUsers';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [activeSection, setActiveSection] = useState('overview'); // overview | shops | orders | users
    const [selectedShopId, setSelectedShopId] = useState('ALL');
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [usersList, setUsersList] = useState([]); // For User Management
    const [stats, setStats] = useState({
        totalShops: 0,
        ordersToday: 0,
        revenueToday: 0,
        activeOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Shops
                const shopsRes = await api.get('/admin/shops');
                if (shopsRes.data.success) {
                    setShops(shopsRes.data.data);
                }

                // 2. Fetch All Orders (for stats)
                const ordersRes = await api.get('/admin/orders'); // Super Admin gets all by default
                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.orders);
                }

                // 3. Fetch Users (if endpoint existed, making placeholder call or empty)
                // const usersRes = await api.get('/admin/users'); 
                // if (usersRes.data.success) setUsersList(usersRes.data.data);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    // Calculate Stats when Orders/Shops/SelectedShop changes
    useEffect(() => {
        if (!orders.length && !shops.length) return;

        let relevantOrders = orders;

        // Filter by shop if not ALL
        if (selectedShopId !== 'ALL') {
            relevantOrders = orders.filter(o => o.shopId === selectedShopId);
        }

        // Calculate Stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const ordersTodayList = relevantOrders.filter(o => new Date(o.createdAt) >= startOfDay);
        const revenue = ordersTodayList.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        const active = relevantOrders.filter(o => ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)).length;

        setStats({
            totalShops: shops.length,
            ordersToday: ordersTodayList.length,
            revenueToday: revenue,
            activeOrders: active
        });

    }, [orders, shops, selectedShopId]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <LoadingSpinner />;

    // Navigation Items
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'shops', label: 'Manage Shops', icon: Store },
        { id: 'orders', label: 'All Orders', icon: ShoppingBag },
        { id: 'users', label: 'All Users', icon: Users },
    ];

    const renderStoreManagement = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage Shops</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={20} /> Add New Shop
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {shops.map(shop => (
                    <div key={shop.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Store size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${shop.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {shop.isOpen ? 'Open' : 'Closed'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{shop.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{shop.adminId ? `Admin ID: ${shop.adminId}` : 'No Admin Assigned'}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <button onClick={() => { setSelectedShopId(shop.id); setActiveSection('overview'); }} className="flex-1 px-3 py-2 text-sm text-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                View Dashboard
                            </button>
                            {/* Reusing ShopStatusToggle logic is tricky without full context, implementing simple toggle call via API usually done here for extensive management */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'shops':
                return <ManageShops />;
            case 'orders':
                // Note: OrderManagement currently shows all orders. 
                // Ideally passing selectedShopId would filter it inside the component.
                return (
                    <div>
                        {/* We can temporarily filter locally if we strictly wanted to, but OrderManagement fetches its own data. 
                             For SuperAdminDashboard v1, we show All Orders or rely on OrderManagement's internal filtering if updated.
                             For now, we just render it. */}
                        <OrderManagement />
                    </div>
                );
            case 'users':
                return <AllUsers />;
            case 'overview':
            default:
                return (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Shops"
                                value={stats.totalShops}
                                icon={Store}
                                color="gray"
                            />
                            <StatCard
                                title="Orders Today"
                                value={stats.ordersToday}
                                icon={ShoppingBag}
                                color="blue"
                            />
                            <StatCard
                                title="Revenue Today"
                                value={`₹${stats.revenueToday.toLocaleString()}`}
                                icon={DollarSign}
                                color="green"
                            />
                            <StatCard
                                title="Active Orders"
                                value={stats.activeOrders}
                                icon={Clock}
                                color="orange"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Shop Management</h3>
                                    <p className="text-gray-500 text-sm mb-4">Add new shops, manage opening hours, and update details.</p>
                                    <button
                                        onClick={() => setActiveSection('shops')}
                                        className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        Go to Manage Shops <ChevronDown className="rotate-[-90deg]" size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">User & Admin Management</h3>
                                    <p className="text-gray-500 text-sm mb-4">Promote users to Shop Admins, assign shops, and manage roles.</p>
                                    <button
                                        onClick={() => setActiveSection('users')}
                                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        Go to User Management <ChevronDown className="rotate-[-90deg]" size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Charts Placeholder */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">System Activity</h3>
                                <button className="text-sm text-blue-600 hover:underline">View Report</button>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                                <TrendingUp className="mr-2" /> Activity Chart Placeholder
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-200 ease-in-out
                md:relative md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-500 p-2 rounded-lg">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">CanteenHQ</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2">Menu</div>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${activeSection === item.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                `}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white border-2 border-slate-600">
                                {user?.name?.[0] || 'S'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Super Admin'}</p>
                                <p className="text-xs text-slate-400 truncate">System Administrator</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-30 px-6 py-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto md:ml-0 w-full md:w-auto justify-end">
                        {/* Shop Selector */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={selectedShopId}
                                onChange={(e) => setSelectedShopId(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium cursor-pointer"
                            >
                                <option value="ALL">All Shops (System View)</option>
                                {shops.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800 capitalize">
                                {activeSection === 'overview' && selectedShopId === 'ALL' ? 'System Overview' :
                                    activeSection === 'overview' ? `${shops.find(s => s.id === selectedShopId)?.name || 'Shop'} Overview` :
                                        navItems.find(i => i.id === activeSection)?.label}
                            </h1>
                            <p className="text-gray-500">
                                {activeSection === 'overview' ? 'Real-time metrics and performance indicators.' : 'Manage your canteen system resources.'}
                            </p>
                        </div>

                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        gray: 'bg-gray-100 text-[#555555]',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
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

export default SuperAdminDashboard;
