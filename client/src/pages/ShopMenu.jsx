import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';
import MenuItem from '../components/user/MenuItem';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ShopMenu = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();

    const [shop, setShop] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopMenu = async () => {
            try {
                // Determine if this is a route for items or just shop + items. 
                // The backend route created earlier was /api/shops/:shopId/items
                // which returns { success: true, shop: {...}, categories: [...] }
                const response = await api.get(`/shops/${shopId}/items`);

                if (response.data && response.data.success) {
                    setShop(response.data.shop);
                    setCategories(response.data.categories);
                } else {
                    setError('Failed to load menu');
                }
            } catch (err) {
                console.error('Error fetching shop menu:', err);
                if (err.response && err.response.status === 404) {
                    setError('Shop not found');
                } else {
                    setError('Something went wrong');
                }
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchShopMenu();
        }
    }, [shopId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
                <button
                    onClick={() => navigate('/home')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="pb-16"> {/* Padding for potential bottom cart bar if added later */}
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/home')}
                    className="mb-4 text-gray-600 hover:text-gray-900 flex items-center transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Browse
                </button>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop?.name}</h1>
                    <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">Open Now</span>
                    </div>
                </div>
            </div>

            {/* Menu Categories */}
            <div className="space-y-8">
                {categories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No items found for this shop.
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.categoryName} className="scroll-mt-24" id={category.categoryName}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                                {category.categoryName}
                                <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {category.items.length}
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {category.items.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        item={{
                                            ...item,
                                            shopId: shop.id,
                                            shopName: shop.name
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ShopMenu;
