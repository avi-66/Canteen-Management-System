import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/user/CartItem';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems: cart,
        totalAmount,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount
    } = useCart();

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 max-w-sm">
                    Looks like you haven't added anything to your cart yet. Browse our canteens to find something delicious!
                </p>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Browse Shops
                </button>
            </div>
        );
    }

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your entire cart?")) {
            clearCart();
        }
    };

    return (
        <div className="pb-24"> {/* Padding for sticky footer */}
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    My Cart
                    <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {getCartCount()} items
                    </span>
                </h1>
                <button
                    onClick={handleClearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                >
                    Clear Cart
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                        />
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Taxes & Fees (5%)</span>
                                <span>₹{Math.round(totalAmount * 0.05)}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 my-4 pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-indigo-600">
                                    ₹{totalAmount + Math.round(totalAmount * 0.05)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>

                        <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex items-start">
                            <span className="mr-2">ⓘ</span>
                            Note: Ordering is only available during shop opening hours.
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold text-indigo-600">
                            ₹{totalAmount + Math.round(totalAmount * 0.05)}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-md"
                    >
                        Checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
