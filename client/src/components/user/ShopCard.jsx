import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const ShopCard = ({ shop }) => {
    const navigate = useNavigate();
    const { id, name, image, isOpen, openingTime, closingTime } = shop;

    const handleCardClick = () => {
        if (isOpen) {
            navigate(`/shop/${id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                relative bg-white rounded-xl shadow-md overflow-hidden 
                transition-all duration-300 ease-in-out
                ${isOpen
                    ? 'cursor-pointer hover:scale-102 hover:shadow-lg'
                    : 'opacity-60 cursor-not-allowed grayscale-[0.5]'
                }
            `}
        >
            {/* Image Section */}
            <div className="h-48 w-full relative">
                <img
                    src={image || "https://via.placeholder.com/400x200?text=Shop"}
                    alt={name}
                    className="w-full h-full object-cover"
                />

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {isOpen ? 'Open' : 'Closed'}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{name}</h3>

                <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                        {openingTime} - {closingTime}
                    </span>
                </div>
            </div>

            {/* Overlay for closed shops to prevent interaction hints (optional, usually handled by css) */}
            {!isOpen && (
                <div className="absolute inset-0 bg-white/10" />
            )}
        </div>
    );
};

export default ShopCard;
