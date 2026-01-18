import React, { useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const DeliverySlotSelector = ({ selectedSlot, onSelect }) => {
    const slots = ["10:30", "12:45", "15:30", "22:00"];

    // Function to format time string "HH:MM" to "HH:MM AM/PM"
    const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const slotsStatus = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        return slots.map(slot => {
            const [h, m] = slot.split(':').map(Number);
            const slotTimeInMinutes = h * 60 + m;

            // Disable if slot is less than 30 minutes from now
            // We assume slots are for TODAY.
            const diff = slotTimeInMinutes - currentTimeInMinutes;
            const disabled = diff < 30;

            return {
                value: slot,
                label: formatTime(slot),
                disabled
            };
        });
    }, []);

    const availableSlotsCount = slotsStatus.filter(s => !s.disabled).length;

    return (
        <div className="space-y-4">
            <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                Select Delivery Slot
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsStatus.map((slot) => {
                    const isSelected = selectedSlot === slot.value;
                    const isDisabled = slot.disabled;

                    let btnClass = "relative py-3 px-4 rounded-xl border font-medium text-sm transition-all duration-200 flex items-center justify-center ";

                    if (isSelected) {
                        btnClass += "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105 z-10";
                    } else if (isDisabled) {
                        btnClass += "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60";
                    } else {
                        btnClass += "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm";
                    }

                    return (
                        <button
                            key={slot.value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onSelect(slot.value)}
                            className={btnClass}
                        >
                            {slot.label}
                        </button>
                    );
                })}
            </div>

            {availableSlotsCount === 0 && (
                <div className="flex items-start p-3 bg-red-50 rounded-lg text-xs text-red-600 border border-red-100">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <p>No delivery slots available for the rest of the day. Please choose Dine-In or try again tomorrow.</p>
                </div>
            )}
        </div>
    );
};

export default DeliverySlotSelector;
