import React, { useState } from 'react';
import { Power, Lock, Unlock, AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';
import classNames from 'classnames';

const ShopStatusToggle = ({ shop, pendingOrders = 0, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

    const isOpen = shop?.isOpen || false;

    const handleToggle = async () => {
        // Guardrail: Confirm closing if pending orders exist
        if (isOpen && pendingOrders > 0) {
            const confirmClose = window.confirm(
                `Warning: You have ${pendingOrders} pending orders. Are you sure you want to close the shop?`
            );
            if (!confirmClose) return;
        }

        setIsLoading(true);
        setError(null);
        setNotification(null);

        try {
            // Optimistic update handled by parent via onUpdate usually, but we'll wait for confirmation here
            // or we could do local state optimism. Let's wait for API to be safe given the "revert" requirement.

            const res = await api.put(`/admin/shop/${shop.id}/toggle`);

            if (res.data.success) {
                const newStatus = res.data.shop.isOpen;
                setNotification({
                    type: 'success',
                    message: `Shop is now ${newStatus ? 'OPEN' : 'CLOSED'}`
                });
                if (onUpdate) {
                    onUpdate(res.data.shop);
                }
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            setError(err.response?.data?.message || "Failed to update shop status");
            // Revert logic is implicit since we didn't change local state optimistically before the call
            // If we did optimistic, we would toggle back here.
        } finally {
            setIsLoading(false);
            // Clear notification after 3 seconds
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Power size={20} className="text-gray-400" />
                        Shop Status
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={classNames(
                            "w-3 h-3 rounded-full animate-pulse",
                            isOpen ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className={classNames(
                            "font-medium",
                            isOpen ? "text-green-600" : "text-red-600"
                        )}>
                            {isOpen ? "Shop is Open" : "Shop is Closed"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={isLoading}
                        className={classNames(
                            "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            isOpen ? "bg-green-500" : "bg-gray-300",
                            isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        )}
                        aria-pressed={isOpen}
                    >
                        <span className="sr-only">Toggle shop status</span>
                        <span
                            className={classNames(
                                "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
                                isOpen ? "translate-x-7" : "translate-x-1"
                            )}
                        />
                    </button>
                    <div className="text-gray-400">
                        {isOpen ? <Unlock size={24} /> : <Lock size={24} />}
                    </div>
                </div>
            </div>

            {/* Guardrail Info */}
            {isOpen && pendingOrders > 0 && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>
                        There are <strong>{pendingOrders} pending orders</strong>.
                        Closing now will prevent new orders but you must still fulfill existing ones.
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Toast Notification (Inline) */}
            {notification && (
                <div className={classNames(
                    "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-500 z-50 flex items-center gap-2",
                    notification.type === 'success' ? "bg-gray-800" : "bg-red-500",
                    "translate-y-0 opacity-100"
                )}>
                    {notification.type === 'success' && <div className="w-2 h-2 bg-green-400 rounded-full" />}
                    {notification.message}
                    <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShopStatusToggle;
