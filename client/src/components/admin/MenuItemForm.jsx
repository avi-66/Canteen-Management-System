import React, { useState, useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';

const MenuItemForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        image: '',
        isVeg: true,
        quantity: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Auto-focus ref
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                category: item.category || '',
                price: item.price || '',
                image: item.image || '',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                quantity: item.quantity !== undefined ? item.quantity : 0
            });
        }
    }, [item]);

    // Focus on mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 2 || formData.name.length > 100) {
            newErrors.name = 'Name must be between 2 and 100 characters';
        }

        if (!formData.category || formData.category.trim().length < 2 || formData.category.length > 50) {
            newErrors.category = 'Category must be between 2 and 50 characters';
        }

        if (!formData.price || Number(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.quantity === '' || Number(formData.quantity) < 0) {
            newErrors.quantity = 'Quantity must be 0 or greater';
        }

        // Optional image URL validation (simple check)
        if (formData.image && !formData.image.startsWith('http')) {
            newErrors.image = 'Image URL must start with http or https';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Form submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                <h3 className="font-bold text-lg text-gray-800">
                    {item ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Name *</label>
                    <input
                        ref={nameInputRef}
                        type="text"
                        placeholder="e.g., Cappuccino"
                        className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                        <input
                            type="text"
                            placeholder="e.g., Beverages"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            value={formData.category}
                            onChange={e => handleChange('category', e.target.value)}
                        />
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) *</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            value={formData.price}
                            onChange={e => handleChange('price', e.target.value)}
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Available Quantity *</label>
                        <input
                            type="number"
                            placeholder="0"
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            value={formData.quantity}
                            onChange={e => handleChange('quantity', e.target.value)}
                        />
                        {errors.quantity ? (
                            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                        ) : (
                            <p className="text-gray-400 text-xs mt-1">Marked unavailable if 0</p>
                        )}
                    </div>
                    <div className="flex items-end pb-3">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg w-full border border-transparent hover:border-gray-100 transition">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                checked={formData.isVeg}
                                onChange={e => handleChange('isVeg', e.target.checked)}
                            />
                            <span className="font-medium text-gray-700">Vegetarian</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (optional)</label>
                    <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.image ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                        value={formData.image}
                        onChange={e => handleChange('image', e.target.value)}
                    />
                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

                    {formData.image && !errors.image && (
                        <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-gray-400 text-center p-1 bg-gray-50">
                                Invalid / Broken Link
                            </div>
                        </div>
                    )}
                </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 flex-shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition focus:ring-2 focus:ring-gray-200 outline-none"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (item ? 'Save Changes' : 'Add Item')}
                </button>
            </div>
        </div>
    );
};

export default MenuItemForm;
