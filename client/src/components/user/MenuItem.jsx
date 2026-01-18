import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MenuItem = ({ item }) => {
    const { id, name, price, image, isVeg, isAvailable, quantity } = item;
    const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

    // Check if item is already in cart
    const cartItem = cartItems.find((i) => i.id === id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        if (isAvailable && quantity > 0) {
            addToCart(item);
        }
    };

    const increaseQuantity = () => {
        if (cartQuantity < quantity) {
            updateQuantity(id, cartQuantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (cartQuantity > 1) {
            updateQuantity(id, cartQuantity - 1);
        } else {
            removeFromCart(id);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col ${!isAvailable || quantity === 0 ? 'opacity-60 grayscale' : ''}`}>
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image || "https://via.placeholder.com/150?text=Food"}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* Veg/Non-Veg Indicator */}
                <div className="absolute top-2 right-2 bg-white p-1 rounded-sm shadow-sm">
                    <div className={`w-3 h-3 rounded-full border ${isVeg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'}`}></div>
                </div>

                {/* Status Badges */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                        Unavailable
                    </div>
                )}
                {isAvailable && quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                        Out of Stock
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{name}</h3>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-gray-900">₹{price}</span>
                        {isAvailable && quantity > 0 && (
                            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                                {quantity} left
                            </span>
                        )}
                    </div>

                    {cartItem ? (
                        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={decreaseQuantity}
                                className="p-2 hover:bg-white rounded-md transition-colors text-gray-700"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-semibold text-gray-900 w-8 text-center">{cartQuantity}</span>
                            <button
                                onClick={increaseQuantity}
                                disabled={cartQuantity >= quantity}
                                className={`p-2 rounded-md transition-colors ${cartQuantity >= quantity ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-white text-gray-700'}`}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={!isAvailable || quantity === 0}
                            className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${!isAvailable || quantity === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            <ShoppingCart size={18} />
                            <span>Add to Cart</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuItem;
