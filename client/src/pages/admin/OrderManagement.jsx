import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, AlertCircle, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import OrderCard from '../../components/admin/OrderCard';
import RejectOrderModal from '../../components/admin/RejectOrderModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderManagement = () => {
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // all | pending | progress | completed
    const [searchTerm, setSearchTerm] = useState('');

    // Rejection Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [rejectLoading, setRejectLoading] = useState(false);
    const [rejectError, setRejectError] = useState('');

    // Poll Interval ref
    const pollInterval = React.useRef(null);

    const fetchOrders = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await api.get('/admin/orders');
            if (res.data.success) {
                setOrders(res.data.orders);
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Don't show error on background poll failure to avoid UI flicker
            if (!isBackground) {
                setError("Failed to load orders. Please try again.");
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    // Initial load and polling setup
    useEffect(() => {
        fetchOrders();

        // Poll every 5 seconds
        pollInterval.current = setInterval(() => {
            fetchOrders(true);
        }, 5000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [fetchOrders]);

    // Derived state for filtered orders
    const getFilteredOrders = () => {
        let filtered = [...orders];

        // 1. Text Search (Token or Customer Name)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                (o.tokenNumber && o.tokenNumber.toLowerCase().includes(lowerTerm)) ||
                (o.userName && o.userName.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. Tab Filter
        switch (activeTab) {
            case 'pending':
                return filtered.filter(o => o.status === 'PLACED');
            case 'progress':
                return filtered.filter(o => ['PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status));
            case 'completed':
                return filtered.filter(o => ['DELIVERED', 'COMPLETED', 'REJECTED'].includes(o.status));
            case 'all':
            default:
                return filtered;
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            if (res.data.success) {
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                ));
                toast.success(`Order status ${newStatus.toLowerCase().replace('_', ' ')}`);
            }
        } catch (err) {
            console.error("Status update failed:", err);
            toast.error(err.response?.data?.message || "Failed to update order status");
        }
    };

    const openRejectModal = (orderId) => {
        setSelectedOrderId(orderId);
        setRejectError('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async (reason) => {
        try {
            setRejectLoading(true);
            const res = await api.put(`/admin/orders/${selectedOrderId}/reject`, { reason });

            if (res.data.success) {
                // Update local state
                setOrders(prev => prev.map(o =>
                    o.id === selectedOrderId ? { ...o, status: 'REJECTED', rejectionReason: reason } : o
                ));
                setRejectModalOpen(false);
                toast.success("Order rejected");
            }
        } catch (err) {
            console.error("Reject failed:", err);
            const msg = err.response?.data?.message || "Failed to reject order";
            setRejectError(msg);
            toast.error(msg); // Optional double notification, but good for visibility
        } finally {
            setRejectLoading(false);
        }
    };

    const filteredOrders = getFilteredOrders();

    // Tabs Config
    const tabs = [
        { id: 'all', label: 'All Orders' },
        { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'PLACED').length },
        { id: 'progress', label: 'In Progress', count: orders.filter(o => ['PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)).length },
        { id: 'completed', label: 'Completed' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                    <p className="text-gray-500">Manage and track customer orders in real-time</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search token or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-4 py-2 rounded-t-lg text-sm font-medium transition-colors relative
                            ${activeTab === tab.id
                                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                        `}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Orders List */}
            {loading ? (
                <LoadingSpinner />
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <Filter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? `No orders match "${searchTerm}"` : "No orders in this category yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusUpdate={handleStatusUpdate}
                            onReject={openRejectModal}
                        />
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            <RejectOrderModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onReject={handleRejectSubmit}
                order={orders.find(o => o.id === selectedOrderId)}
                isSubmitting={rejectLoading}
                error={rejectError}
            />
        </div>
    );
};

export default OrderManagement;
