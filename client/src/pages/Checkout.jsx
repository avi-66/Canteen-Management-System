import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import DeliverySlotSelector from '../components/user/DeliverySlotSelector';
import OrderConfirmation from '../components/user/OrderConfirmation';
import api from '../services/api';
import {
    ShoppingBag,
    Utensils,
    Truck,
    MapPin,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react';

const Checkout = () => {
    const { cartItems, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();

    const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' | 'delivery'
    const [selectedSlot, setSelectedSlot] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('processing'); // 'processing' | 'success' | 'error'
    const [error, setError] = useState('');

    // Modal state
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    useEffect(() => {
        // Only redirect if cart is empty AND we haven't just placed an order
        if (cartItems.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
    }, [cartItems, navigate, orderPlaced]);

    const validateForm = () => {
        if (orderType === 'delivery') {
            if (!selectedSlot) return "Please select a delivery slot.";
            if (!deliveryAddress || deliveryAddress.length < 10) return "Please enter a valid delivery address (min 10 characters).";
        }
        return null;
    };

    const handlePlaceOrder = async () => {
        setError('');
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const confirmMessage = orderType === 'dine-in'
            ? "Confirm place order for Dine-In?"
            : "Proceed to payment and place delivery order?";

        if (!window.confirm(confirmMessage)) return;

        if (orderType === 'delivery') {
            setShowPaymentModal(true);
            setPaymentStatus('processing');
            // Simulate Payment
            setTimeout(() => {
                setPaymentStatus('success');
                setTimeout(() => {
                    submitOrder();
                }, 1000);
            }, 2000);
        } else {
            submitOrder();
        }
    };

    const submitOrder = async () => {
        setIsSubmitting(true);
        try {
            const shopId = cartItems[0]?.shopId;
            const orderData = {
                items: cartItems.map(item => ({
                    itemId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                })),
                totalAmount,
                shopId,
                orderType: orderType.toUpperCase().replace('-', '_'), // 'DINE_IN' or 'DELIVERY'
                ...(orderType === 'delivery' && {
                    deliverySlot: selectedSlot,
                    deliveryAddress
                })
            };

            const response = await api.post('/orders/place', orderData);

            // Assume 201 Created or 200 OK
            const { order } = response.data; // Adjust based on actual API response
            const tokenNumber = order?.token || order?.tokenNumber || 'N/A'; // Or however the backend returns it

            clearCart();

            // Set order details for confirmation modal layout
            setConfirmedOrder({
                ...order,
                tokenNumber, // Ensure token is explicit
                orderType: orderData.orderType,
                deliverySlot: orderData.deliverySlot,
                deliveryAddress: orderData.deliveryAddress
            });

            setOrderPlaced(true);

        } catch (err) {
            console.error('Order submission failed:', err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            setShowPaymentModal(false); // Close modal if open on error
        } finally {
            setIsSubmitting(false);
        }
    };

    // If empty cart and NOT placed order, useEffect redirects. 
    // If placed order, we show the modal, so return null/modal here is fine.
    // If cart has items, render form.
    if (cartItems.length === 0 && !orderPlaced) return null;

    return (
        <div className="max-w-7xl mx-auto py-6">
            <OrderConfirmation isOpen={orderPlaced} order={confirmedOrder} />

            <div className="flex items-center mb-8">
                <Link to="/cart" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Cart
                </Link>
                <h1 className="ml-4 text-3xl font-bold text-gray-900">Checkout</h1>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${orderPlaced ? 'opacity-50 pointer-events-none blur-sm' : ''}`}>

                {/* Section 1: Cart Summary */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-2 text-indigo-500" />
                                Order Summary
                            </h2>
                            <span className="text-sm text-gray-500">{cartItems.length} items</span>
                        </div>
                        <div className="p-6">
                            <ul className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="py-3 flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Tax (0%)</span>
                                    <span className="font-medium">₹0</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold text-indigo-900 pt-4 border-t border-dashed border-gray-200">
                                    <span>Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 & 3: Order Form */}
                <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">

                    {/* Order Type Selection */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Utensils className="w-6 h-6 mr-3 text-indigo-500" />
                            How would you like to receive your order?
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => setOrderType('dine-in')}
                                className={`cursor-pointer rounded-xl border-2 p-5 flex items-center space-x-4 transition-all duration-200 ${orderType === 'dine-in'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]'
                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${orderType === 'dine-in' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Utensils className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${orderType === 'dine-in' ? 'text-indigo-900' : 'text-gray-900'}`}>Dine-In</h3>
                                    <p className="text-sm text-gray-500">Eat at the canteen</p>
                                </div>
                                <div className="ml-auto">
                                    {orderType === 'dine-in' ? (
                                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>
                            </div>

                            <div
                                onClick={() => setOrderType('delivery')}
                                className={`cursor-pointer rounded-xl border-2 p-5 flex items-center space-x-4 transition-all duration-200 ${orderType === 'delivery'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]'
                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${orderType === 'delivery' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${orderType === 'delivery' ? 'text-indigo-900' : 'text-gray-900'}`}>Delivery</h3>
                                    <p className="text-sm text-gray-500">Deliver to your workspace</p>
                                </div>
                                <div className="ml-auto">
                                    {orderType === 'delivery' ? (
                                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Fields for Delivery */}
                    {orderType === 'delivery' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <MapPin className="w-6 h-6 mr-3 text-indigo-500" />
                                Delivery Details
                            </h2>

                            <div className="space-y-8">
                                <DeliverySlotSelector
                                    selectedSlot={selectedSlot}
                                    onSelect={setSelectedSlot}
                                />

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Delivery Address / Desk Location
                                    </label>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="E.g. Building A, 3rd Floor, Desk 42"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 min-h-[100px] text-gray-700"
                                    />
                                    <p className="text-xs text-gray-500 text-right">{deliveryAddress.length}/10 chars min</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex flex-col items-center pt-4">
                        {error && (
                            <div className="w-full mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting}
                            className={`w-full py-4 px-6 rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 transition-all transform duration-200 flex items-center justify-center ${isSubmitting
                                ? 'bg-indigo-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-xl text-white'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {orderType === 'dine-in' ? (
                                        <>Place Order (No Payment Required)</>
                                    ) : (
                                        <>Simulate Payment & Place Order</>
                                    )}
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Simulated Payment Modal - Only show if order is NOT yet marked placed */}
            {showPaymentModal && !orderPlaced && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        {paymentStatus === 'processing' && (
                            <div className="text-center py-8">
                                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                                <p className="text-gray-600">Please wait while we secure your transaction...</p>
                            </div>
                        )}
                        {paymentStatus === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600">Redirecting to order confirmation...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
