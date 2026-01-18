import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    MapPin,
    AlertCircle,
    Utensils,
    ShoppingBag
} from 'lucide-react';

const OrderCard = ({ order, onStatusUpdate, onReject }) => {
    const [expanded, setExpanded] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isNew = (createdAt) => {
        const diff = new Date() - new Date(createdAt);
        return diff < 2 * 60 * 1000; // 2 minutes
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            PLACED: 'bg-blue-100 text-blue-800 border-blue-200',
            PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            READY: 'bg-gray-200 text-[#555555] border-gray-300',
            OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            DELIVERED: 'bg-green-100 text-green-800 border-green-200',
            COMPLETED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const handleAction = async (newStatus) => {
        if (newStatus === 'COMPLETED' || newStatus === 'DELIVERED') {
            if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
        }

        setActionLoading(true);
        await onStatusUpdate(order.id, newStatus);
        setActionLoading(false);
    };

    return (
        <div className={`
            bg-white rounded-lg shadow-sm border transition-all duration-200
            ${isNew(order.createdAt) ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}
            hover:shadow-md
        `}>
            {/* Header / Summary */}
            <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Token & Basic Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-gray-800 font-mono">
                                #{order.tokenNumber?.split('_').pop() || '000'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wide border ${getStatusBadge(order.status)}`}>
                                {order.status.replace(/_/g, ' ')}
                            </span>
                            {isNew(order.createdAt) && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{order.userName}</span>
                            <span className="flex items-center gap-1">
                                {order.orderType === 'DELIVERY' ? <Truck size={14} /> : <Utensils size={14} />}
                                {order.orderType}
                            </span>
                            {order.orderType === 'DELIVERY' && (
                                <span className="flex items-center gap-1 text-gray-500">
                                    <Clock size={14} />
                                    {order.deliverySlot}
                                </span>
                            )}
                        </div>
                        {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                                <span className="truncate max-w-md">{order.deliveryAddress}</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                        <div className="text-right mr-2">
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                            <div className="text-xs text-gray-500">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Action Buttons based on status */}
                            {order.status === 'PLACED' && (
                                <>
                                    <button
                                        onClick={() => onReject(order.id)}
                                        disabled={actionLoading}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                        title="Reject Order"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleAction('PREPARING')}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        Accept
                                    </button>
                                </>
                            )}

                            {order.status === 'PREPARING' && (
                                <button
                                    onClick={() => handleAction('READY')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Mark Ready
                                </button>
                            )}

                            {order.status === 'READY' && order.orderType === 'DINE_IN' && (
                                <button
                                    onClick={() => handleAction('COMPLETED')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Complete
                                </button>
                            )}

                            {order.status === 'READY' && order.orderType === 'DELIVERY' && (
                                <button
                                    onClick={() => handleAction('OUT_FOR_DELIVERY')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Truck size={16} /> Dispatch
                                </button>
                            )}

                            {order.status === 'OUT_FOR_DELIVERY' && (
                                <button
                                    onClick={() => handleAction('DELIVERED')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Delivered
                                </button>
                            )}

                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-lg animate-fadeIn">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 flex items-center justify-center bg-gray-200 rounded text-xs font-medium text-gray-700">
                                        {item.quantity}x
                                    </span>
                                    <span className="text-gray-800">{item.name}</span>
                                </div>
                                <span className="text-gray-600 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    {order.status === 'REJECTED' && order.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                            <span className="font-semibold">Rejection Reason:</span> {order.rejectionReason}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;
