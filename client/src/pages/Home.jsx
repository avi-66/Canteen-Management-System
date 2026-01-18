import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ShopCard from '../components/user/ShopCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Loader2 } from 'lucide-react';

const Home = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await api.get('/shops');
                if (response.data && response.data.success) {
                    setShops(response.data.shops);
                } else {
                    setError('Failed to load shops');
                }
            } catch (err) {
                console.error('Error fetching shops:', err);
                setError(err.response?.data?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] text-red-500">
                <p className="text-xl font-semibold mb-2">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4">
                    Browse Shops
                </h1>
                <p className="text-gray-600 mt-2 pl-4">
                    Select a canteen to view their menu and order
                </p>
            </header>

            {shops.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                    <Loader2 className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-lg">No shops available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shops.map((shop) => (
                        <ShopCard key={shop.id} shop={shop} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
