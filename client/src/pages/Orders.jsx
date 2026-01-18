import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // keeping useLocation if needed later or removing if unused
import api from '../services/api';
import OrderCard from '../components/user/OrderCard';
import { ShoppingBag, Loader2, Filter, AlertCircle } from 'lucide-react';
import classNames from 'classnames';

const Orders = () => {
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'all' | 'active' | 'completed'

    // Polling Ref
    const pollingInterval = useRef(null);

    // Fetch Orders
    const fetchOrders = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data.orders);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Only show error on full load, not background refresh
            if (!isBackground) setError("Unable to load orders. Please try again.");
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    // Helper to check if any active orders exist to decide polling
    const hasActiveOrders = (orderList) => {
        const activeStatuses = ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
        return orderList.some(o => activeStatuses.includes(o.status));
    };

    // Initial Load & Polling Setup
    useEffect(() => {
        fetchOrders();
    }, []);

    // Polling Logic
    useEffect(() => {
        // Stop any existing poll
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        // Determine if we need to poll
        if (hasActiveOrders(orders)) {
            pollingInterval.current = setInterval(() => {
                fetchOrders(true);
            }, 5000);
        }

        // Cleanup on unmount
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [orders]);

    // Filtering
    const getFilteredOrders = () => {
        const activeStatuses = ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
        const completedStatuses = ['DELIVERED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

        return orders.filter(order => {
            if (activeTab === 'all') return true;
            if (activeTab === 'active') return activeStatuses.includes(order.status);
            if (activeTab === 'completed') return completedStatuses.includes(order.status);
            return true;
        });
    };

    const filteredOrders = getFilteredOrders();

    // Render Helpers
    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (error && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <p>{error}</p>
                <button onClick={() => fetchOrders()} className="mt-4 text-indigo-600 font-medium hover:underline">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
                    <ShoppingBag className="w-6 h-6 mr-3 text-indigo-500" />
                    My Orders
                </h1>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    {['active', 'completed', 'all'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={classNames(
                                "px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200",
                                {
                                    "bg-white text-indigo-600 shadow-sm": activeTab === tab,
                                    "text-gray-500 hover:text-gray-700": activeTab !== tab
                                }
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                        <Filter className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No {activeTab === 'all' ? '' : activeTab} orders found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        {activeTab === 'active'
                            ? "You don't have any ongoing orders at the moment."
                            : "Your order history is empty."}
                    </p>
                    {activeTab === 'all' && (
                        <a href="/home" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            Start Browsing
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;
