import React, { useState } from 'react';
import { eventAPI } from '../api/axiosInstance';

const StripePayment = ({ eventId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Processing payment for event:', eventId);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      // Direct registration for mock payment
      const response = await eventAPI.register(eventId);
      console.log('Registration response:', response);
      
      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Expiry</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CVC</label>
            <input
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StripePayment;