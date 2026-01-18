import React, { useState, useEffect } from 'react';
import { Search, UserCog, Shield, Store, AlertCircle, X, Check } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const AllUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all | user | shop_admin | super_admin
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('USER');
    const [selectedShopId, setSelectedShopId] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, shopsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/shops')
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.data);
            if (shopsRes.data.success) setShops(shopsRes.data.data);

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChangeRequest = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setSelectedShopId(''); // Reset shop selection
        setModalError('');
        setModalOpen(true);
    };

    const handleSubmitRoleChange = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');

        try {
            if (newRole === 'SHOP_ADMIN' && selectedUser.role !== 'SHOP_ADMIN' && !selectedShopId) {
                throw new Error("Please assign a shop to the new Shop Admin");
            }

            const payload = { role: newRole };
            if (newRole === 'SHOP_ADMIN') {
                payload.shopId = selectedShopId;
            }

            const res = await api.put(`/admin/users/${selectedUser.id}/role`, payload);

            if (res.data.success) {
                // Update local state
                setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
                setModalOpen(false);
                toast.success(`Role updated to ${newRole}`);

                // Also refresh shops in case assignments changed (e.g. adminId updated)
                const shopsRes = await api.get('/admin/shops');
                if (shopsRes.data.success) setShops(shopsRes.data.data);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Failed to update role";
            setModalError(msg);
            // Optional: toast error too if complex, but modal msg is fine. 
            // Let's toast for fatal errors or network issues.
            if (!err.response && !err.message.includes('assign a shop')) toast.error(msg);
        } finally {
            setModalLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'shop_admin' ? user.role === 'SHOP_ADMIN' :
                    filter === 'super_admin' ? user.role === 'SUPER_ADMIN' :
                        user.role === 'USER';

        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-200 text-[#555555] border border-gray-300">Super Admin</span>;
            case 'SHOP_ADMIN': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Shop Admin</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">User</span>;
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                    <p className="text-sm text-gray-500">{users.length} registered users</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                {[
                    { id: 'all', label: 'All Users' },
                    { id: 'user', label: 'Users' },
                    { id: 'shop_admin', label: 'Shop Admins' },
                    { id: 'super_admin', label: 'Super Admins' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Shop Assigned</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No users match your filters.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => {
                                // Find assigned shop if any
                                const assignedShop = shops.find(s => s.adminId === user.id);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {assignedShop ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Store size={14} className="text-blue-500" />
                                                    <span className="font-medium">{assignedShop.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleRoleChangeRequest(user)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    Change Role
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Change Role Modal */}
            {modalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UserCog size={20} className="text-blue-600" />
                                Change Role
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRoleChange} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="font-medium text-gray-900">{selectedUser.name}</div>
                                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="USER">User (Standard)</option>
                                    <option value="SHOP_ADMIN">Shop Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            {/* Shop Selection if becoming Shop Admin */}
                            {newRole === 'SHOP_ADMIN' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Shop <span className="text-red-500">*</span></label>
                                    <select
                                        value={selectedShopId}
                                        onChange={(e) => setSelectedShopId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select a shop...</option>
                                        {shops.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.adminId ? '(Has Admin)' : '(Unassigned)'}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Assigning to a shop that already has an admin will replace them.
                                    </p>
                                </div>
                            )}

                            {/* Warning if demoting Shop Admin */}
                            {selectedUser.role === 'SHOP_ADMIN' && newRole !== 'SHOP_ADMIN' && (
                                <div className="flex items-start gap-2 p-3 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <p>This will remove the user from their assigned shop management.</p>
                                </div>
                            )}

                            {modalError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
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
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsers;
