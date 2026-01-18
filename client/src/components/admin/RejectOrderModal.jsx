import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const RejectOrderModal = ({ order, isOpen, onClose, onReject, isSubmitting, error }) => {
    const [reason, setReason] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (reason.trim().length < 10) {
            setLocalError('Reason must be at least 10 characters long');
            return;
        }

        onReject(reason);
    };

    const handleChange = (e) => {
        setReason(e.target.value);
        if (localError) setLocalError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-title"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 id="reject-title" className="text-lg font-bold text-gray-900">
                        Reject Order {order?.tokenNumber && <span className="font-mono text-gray-700">#{order.tokenNumber.split('_').pop()}</span>}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm">
                            This action cannot be undone. It will refund the customer (if applicable) and restore item quantities to stock.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                rows={4}
                                className={`
                                    w-full p-3 border rounded-lg shadow-sm focus:ring-2 outline-none text-sm transition-all
                                    ${localError || error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'}
                                `}
                                placeholder="Please explain why the order is being rejected..."
                                value={reason}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between mt-2">
                                <span className={`text-xs ${reason.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {reason.length < 10 ? `Minimum 10 chars required` : 'Great!'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {reason.length}/500
                                </span>
                            </div>
                        </div>

                        {(localError || error) && (
                            <p className="mb-4 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {localError || error}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || reason.length < 10}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Rejecting...
                                    </>
                                ) : (
                                    'Confirm Rejection'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RejectOrderModal;
