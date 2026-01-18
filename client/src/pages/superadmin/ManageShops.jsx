import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Clock, User, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ManageShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        openingTime: '09:00',
        closingTime: '18:00',
        image: ''
    });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/shops');
            if (res.data.success) {
                setShops(res.data.data);
            }
        } catch (err) {
            setError('Failed to fetch shops');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setEditingShop(null);
        setFormData({ name: '', adminEmail: '', openingTime: '09:00', closingTime: '18:00', image: '' });
        setModalError('');
        setModalOpen(true);
    };

    const openEditModal = (shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name || '',
            adminEmail: shop.adminEmail || '', // Assuming backend now returns this
            openingTime: shop.openingTime || '09:00',
            closingTime: shop.closingTime || '18:00',
            image: shop.image || ''
        });
        setModalError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingShop(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');

        try {
            // Validation
            if (!formData.name || (!editingShop && !formData.adminEmail) || !formData.openingTime || !formData.closingTime) {
                throw new Error('All required fields must be filled');
            }

            if (editingShop) {
                const res = await api.put(`/admin/shops/${editingShop.id}`, formData);
                if (res.data.success) {
                    setShops(shops.map(s => s.id === editingShop.id ? res.data.shop : s));
                    toast.success("Shop updated successfully");
                    closeModal();
                }
            } else {
                const res = await api.post('/admin/shops', formData); // Aliased to /shops in admin routes
                if (res.data.success) {
                    setShops([...shops, res.data.shop]);
                    toast.success("Shop created successfully");
                    closeModal();
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Operation failed';
            setModalError(msg);
            // We can also toast error if we want, but modal error is inline which is good.
            // Let's toast generic failure if not inline.
            if (!err.response && !err.message.includes('required')) toast.error(msg);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (shopId) => {
        if (!window.confirm("Are you sure you want to delete this shop?")) return;

        try {
            const res = await api.delete(`/admin/shops/${shopId}`);
            if (res.data.success) {
                setShops(shops.filter(s => s.id !== shopId));
                toast.success("Shop deleted successfully");
            }
        } catch (err) {
            toast.error("Failed to delete shop");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">All Shops</h2>
                    <p className="text-sm text-gray-500">{shops.length} total shops active</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Add Shop
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">Shop Name</th>
                                <th className="p-4">Admin Email</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Timings</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {shops.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No shops found. Create your first one!
                                    </td>
                                </tr>
                            ) : shops.map((shop) => (
                                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{shop.name}</div>
                                        <div className="text-xs text-gray-400">ID: {shop.id}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            {shop.adminEmail || shop.adminId || "Unassigned"}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium border ${shop.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                            } `}>
                                            {shop.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} className="text-gray-400" />
                                            {shop.openingTime} - {shop.closingTime}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(shop)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onClick={() => handleDelete(shop.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingShop ? 'Edit Shop' : 'Add New Shop'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Juice Corner"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email {editingShop ? '(Cannot be changed here)' : <span className="text-red-500">*</span>}</label>
                                <input
                                    type="email"
                                    name="adminEmail"
                                    required={!editingShop}
                                    disabled={!!editingShop}
                                    value={formData.adminEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${editingShop ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                    placeholder="admin@college.edu"
                                />
                                {!editingShop && <p className="text-xs text-gray-500 mt-1">If user exists, they will be upgraded to Shop Admin.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                                    <input
                                        type="time"
                                        name="openingTime"
                                        required
                                        value={formData.openingTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                                    <input
                                        type="time"
                                        name="closingTime"
                                        required
                                        value={formData.closingTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {modalError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={modalLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    disabled={modalLoading}
                                >
                                    {modalLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                                    {editingShop ? 'Save Changes' : 'Create Shop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageShops;
