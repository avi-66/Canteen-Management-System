import React, { useState } from 'react';
import {
    Clock,
    MapPin,
    ChevronDown,
    ChevronUp,
    Utensils,
    Truck,
    CheckCircle,
    XCircle,
    ShoppingBag,
    ChefHat
} from 'lucide-react';

const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PLACED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'READY': return 'bg-green-100 text-green-800 border-green-200';
            case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'DELIVERED':
            case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'PLACED': return <Clock className="w-4 h-4 mr-1" />;
            case 'PREPARING': return <ChefHat className="w-4 h-4 mr-1" />;
            case 'READY': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'OUT_FOR_DELIVERY': return <Truck className="w-4 h-4 mr-1" />;
            case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'REJECTED': return <XCircle className="w-4 h-4 mr-1" />;
            default: return <Clock className="w-4 h-4 mr-1" />;
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Header Section */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        <span className="font-mono text-lg font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            {order.tokenNumber}
                        </span>
                        <div>
                            <h3 className="font-semibold text-gray-800">{order.shopName}</h3>
                            <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                    </div>

                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
                        <StatusIcon status={order.status} />
                        {order.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center">
                            {order.orderType === 'DELIVERY' ? <Truck className="w-4 h-4 mr-1 text-indigo-500" /> : <Utensils className="w-4 h-4 mr-1 text-indigo-500" />}
                            <span className="capitalize">{order.orderType?.replace('_', ' ').toLowerCase()}</span>
                        </div>
                        <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Expandable Details Section */}
            {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-5 animate-in slide-in-from-top-2 duration-200">

                    {/* Delivery Info */}
                    {order.orderType === 'DELIVERY' && (
                        <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-2" /> Delivery Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-2" />
                                    Slot: <span className="font-medium ml-1">{order.deliverySlot}</span>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="w-3 h-3 mr-2 mt-1" />
                                    <span>{order.deliveryAddress}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <ShoppingBag className="w-4 h-4 mr-2" /> Order Items
                        </h4>
                        <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="p-3 flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-500 w-6 mr-2">{item.quantity}x</span>
                                        <span className="text-gray-800">{item.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-600">₹{item.price * item.quantity}</span>
                                </li>
                            ))}
                            <li className="p-3 bg-gray-50 flex justify-between items-center font-bold text-gray-900 rounded-b-lg">
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Rejection Reason & Refund Status */}
                    {order.status === 'REJECTED' && (
                        <div className="mt-4 space-y-2">
                            {order.rejectionReason && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block mb-1">Order Rejected</span>
                                        {order.rejectionReason}
                                    </div>
                                </div>
                            )}

                            {order.paymentStatus === 'REFUNDED' && (
                                <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold">Refund Processed: </span>
                                        Amount of ₹{order.totalAmount} has been refunded to your source account.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;
