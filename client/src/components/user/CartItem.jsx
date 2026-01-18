import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
    const { id, name, price, image, quantity } = item;

    const handleIncrease = () => {
        updateQuantity(id, quantity + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            updateQuantity(id, quantity - 1);
        }
    };

    const handleRemove = () => {
        if (window.confirm(`Remove ${name} from cart?`)) {
            removeFromCart(id);
        }
    };

    return (
        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
            {/* Image */}
            <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                <img
                    src={image || "https://via.placeholder.com/150?text=Food"}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                    <p className="text-gray-500 text-sm">₹{price} per item</p>
                </div>

                <div className="flex items-center mt-3 sm:mt-0 space-x-6">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={handleDecrease}
                            disabled={quantity <= 1}
                            className={`p-1.5 rounded-md transition-colors ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{quantity}</span>
                        <button
                            onClick={handleIncrease}
                            className="p-1.5 text-gray-600 hover:bg-white hover:text-indigo-600 rounded-md transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Subtotal */}
                    <div className="min-w-[80px] text-right hidden sm:block">
                        <p className="font-bold text-gray-900">₹{price * quantity}</p>
                    </div>

                    {/* Remove Action */}
                    <button
                        onClick={handleRemove}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove item"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Subtotal (Only visible on small screens) */}
            <div className="sm:hidden ml-auto flex flex-col items-end">
                <p className="font-bold text-gray-900 mb-2">₹{price * quantity}</p>
            </div>
        </div>
    );
};

export default CartItem;
