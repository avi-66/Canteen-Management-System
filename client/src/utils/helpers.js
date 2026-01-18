import { ORDER_STATUS } from './constants';

export const formatTime = (time) => {
    if (!time) return '';
    // Assume time is "HH:MM" 24hr format or ISO
    if (time.includes('T')) {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
};

export const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${Number(amount).toFixed(2)}`;
};

export const isSlotAvailable = (slot) => {
    if (!slot) return false;
    const [hours, minutes] = slot.split(':');
    const slotDate = new Date();
    slotDate.setHours(hours);
    slotDate.setMinutes(minutes);
    slotDate.setSeconds(0);

    // If slot is past today (e.g. 10:30 AM and now is 11 AM), it's not available for *today*
    // Requirement says ">= 30 mins from now".
    const now = new Date();
    const diffInMs = slotDate - now;
    const diffInMins = Math.floor(diffInMs / 1000 / 60);

    return diffInMins >= 30;
};

export const getStatusColor = (status) => {
    switch (status) {
        case ORDER_STATUS.PLACED: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case ORDER_STATUS.PREPARING: return 'text-blue-600 bg-blue-50 border-blue-200';
        case ORDER_STATUS.READY: return 'text-[#555555] bg-gray-100 border-gray-300';
        case ORDER_STATUS.OUT_FOR_DELIVERY: return 'text-orange-600 bg-orange-50 border-orange-200';
        case ORDER_STATUS.DELIVERED: return 'text-green-600 bg-green-50 border-green-200';
        case ORDER_STATUS.COMPLETED: return 'text-green-600 bg-green-50 border-green-200';
        case ORDER_STATUS.REJECTED: return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};
