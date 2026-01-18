import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home, ArrowRight, Truck, Utensils, X } from 'lucide-react';


const OrderConfirmation = ({ order, isOpen }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(30);

    // Auto-dismiss logic
    useEffect(() => {
        let timer;
        let countdown;
        if (isOpen) {
            setTimeLeft(30);
            timer = setTimeout(() => {
                navigate('/orders');
            }, 30000);

            countdown = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => {
            clearTimeout(timer);
            clearInterval(countdown);
        };
    }, [isOpen, navigate]);

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 relative">

                {/* Success Banner */}
                <div className="bg-green-500 pt-8 pb-12 px-8 text-center relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-600/20 transform hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Success!</h2>
                    <p className="text-green-100 font-medium">Thank you for your order</p>
                </div>

                {/* Ticket Content */}
                <div className="px-8 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">

                    <div className="text-center mb-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Order Token</p>
                        <div className="inline-block bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-6 py-4">
                            <span className="text-3xl font-mono font-bold text-gray-800 tracking-wider select-all">{order.tokenNumber}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start">
                            {order.orderType === 'DELIVERY' || order.orderType === 'delivery' ? (
                                <Truck className="w-5 h-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                            ) : (
                                <Utensils className="w-5 h-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                            )}
                            <div>
                                <h4 className="font-semibold text-indigo-900 mb-1">
                                    {order.orderType === 'DELIVERY' || order.orderType === 'delivery' ? 'Delivery Order' : 'Dine-In Order'}
                                </h4>
                                <p className="text-sm text-indigo-700 leading-relaxed">
                                    {order.orderType === 'DELIVERY' || order.orderType === 'delivery'
                                        ? `Your order will be delivered by ${order.deliverySlot} to ${order.deliveryAddress}.`
                                        : "Please show the token above at the counter when your number is called."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center"
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            My Orders
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-300 mt-6">
                        Redirecting in {timeLeft} seconds...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
