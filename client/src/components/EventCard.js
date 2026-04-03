import React, { useState } from 'react';
import StripePayment from './StripePayment';

const EventCard = ({ event, onRegister, onCancel, isRegistered }) => {
  const [showPayment, setShowPayment] = useState(false);
  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Technical': 'bg-orange-100 text-orange-800',
      'Social': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = () => {
    if (isRegistered) return 'bg-green-100 text-green-800';
    if (event.registeredCount >= event.capacity) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = () => {
    if (isRegistered) return 'Registered';
    if (event.registeredCount >= event.capacity) return 'Full';
    return 'Available';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{event.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600">
            {event.fees > 0 ? `$${event.fees}` : 'Free'}
          </p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🕒</span>
          <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{event.registeredCount}/{event.capacity}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Registration Progress</span>
          <span>{Math.round((event.registeredCount / event.capacity) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{width: `${(event.registeredCount / event.capacity) * 100}%`}}
          ></div>
        </div>
      </div>

      {showPayment ? (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Payment Details</h4>
          <StripePayment
            eventId={event._id}
            amount={event.fees}
            onSuccess={() => {
              setShowPayment(false);
              onRegister(event._id);
            }}
            onCancel={() => setShowPayment(false)}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          {isRegistered ? (
            <button
              onClick={() => onCancel(event._id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Cancel Registration
            </button>
          ) : (
            <button
              onClick={() => event.fees > 0 ? setShowPayment(true) : onRegister(event._id)}
              disabled={event.registeredCount >= event.capacity}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 transition-colors"
            >
              {event.registeredCount >= event.capacity
                ? 'Event Full'
                : event.fees > 0
                ? `Pay $${event.fees}`
                : 'Register Free'}
            </button>
          )}
          <button className="px-4 py-2 border border-indigo-500 text-indigo-500 rounded hover:bg-indigo-50 transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;