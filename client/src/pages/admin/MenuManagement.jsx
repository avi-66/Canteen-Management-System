import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    AlertCircle,
    Check,
    X,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import api from '../../services/api';
import MenuItemForm from '../../components/admin/MenuItemForm';

const MenuManagement = () => {
    // Data State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const initialFormState = {
        name: '',
        category: '',
        price: '',
        image: '',
        isVeg: true,
        quantity: 0,
        isAvailable: true // Default True for new items
    };
    const [formData, setFormData] = useState(initialFormState);

    // Toast State (Simple inline notification)
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }

    // Fetch Items
    const fetchItems = async () => {
        try {
            // Logic to handle polling background refresh vs initial load
            if (loading) setLoading(true);

            const res = await api.get('/admin/items');
            if (res.data.success) {
                setItems(res.data.data);
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch items:", err);
            // Only show error on initial load, not polling
            if (loading) setError("Failed to load menu items.");
        } finally {
            setLoading(false);
        }
    };

    // Poll every 10 seconds
    useEffect(() => {
        fetchItems();
        const interval = setInterval(fetchItems, 10000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Actions ---

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image || '',
            isVeg: item.isVeg,
            quantity: item.quantity,
            isAvailable: item.isAvailable
        });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.category || !formData.price || formData.price < 1 || formData.quantity < 0) {
            showToast('error', 'Please fill all required fields correctly.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingItem) {
                // Update
                const res = await api.put(`/admin/items/${editingItem.id}`, formData);
                if (res.data.success) {
                    showToast('success', 'Item updated successfully');
                    fetchItems();
                    setIsModalOpen(false);
                }
            } else {
                // Add
                const res = await api.post('/admin/items', formData);
                if (res.data.success) {
                    showToast('success', 'Item added successfully');
                    fetchItems();
                    setIsModalOpen(false);
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            showToast('error', err.response?.data?.message || 'Failed to save item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        setIsSubmitting(true);
        try {
            const res = await api.delete(`/admin/items/${itemToDelete.id}`);
            if (res.data.success) {
                showToast('success', 'Item deleted successfully');
                fetchItems();
                setIsDeleteModalOpen(false);
            }
        } catch (err) {
            console.error("Delete error:", err);
            showToast('error', err.response?.data?.message || 'Failed to delete item');
        } finally {
            setIsSubmitting(false);
            setItemToDelete(null);
        }
    };

    const handleToggleAvailability = async (item) => {
        // Optimistic UI update
        const originalItems = [...items];
        setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));

        try {
            const res = await api.put(`/admin/items/${item.id}/availability`, { isAvailable: !item.isAvailable });
            if (!res.data.success) throw new Error("Failed");
            showToast('success', `Item is now ${!item.isAvailable ? 'Available' : 'Unavailable'}`);
        } catch (err) {
            // Revert
            setItems(originalItems);
            showToast('error', 'Failed to update availability');
        }
    };

    // Filter Items
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- UI Components ---

    if (loading && items.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                    <p className="text-gray-500">Manage your shop's menu items, pricing, and availability.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus size={20} />
                    Add New Item
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Could add Category Filter Dropdown here */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    {item.name}
                                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{item.price}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item.quantity} units
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.isAvailable}
                                                onChange={() => handleToggleAvailability(item)}
                                                disabled={item.quantity <= 0} // Auto-disable if out of stock
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDelete(item)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No items found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <MenuItemForm
                        item={editingItem}
                        onSave={async (data) => {
                            // Adapter to match existing handleSubmit signature logic or refactor handleSubmit
                            // Let's refactor handleSubmit logic to be usable here easily
                            // We need to return a promise that resolves when done for the form's internal state

                            // Re-using logic from original handleSubmit but accepting data argument
                            try {
                                if (editingItem) {
                                    const res = await api.put(`/admin/items/${editingItem.id}`, data);
                                    if (res.data.success) {
                                        showToast('success', 'Item updated successfully');
                                        fetchItems();
                                        setIsModalOpen(false);
                                    }
                                } else {
                                    const res = await api.post('/admin/items', data);
                                    if (res.data.success) {
                                        showToast('success', 'Item added successfully');
                                        fetchItems();
                                        setIsModalOpen(false);
                                    }
                                }
                            } catch (err) {
                                console.error("Submit error:", err);
                                showToast('error', err.response?.data?.message || 'Failed to save item');
                                throw err; // Propagate to form to stop submitting state
                            }
                        }}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Item?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete <span className="font-bold text-gray-800">"{itemToDelete?.name}"</span>?
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-3 animate-slide-up z-50 ${toast.type === 'success' ? 'bg-gray-800' : 'bg-red-500'
                    }`}>
                    {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
