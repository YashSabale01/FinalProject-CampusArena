import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signup(formData);
      } else {
        await login({ username: formData.username, password: formData.password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isSignup ? 'Sign Up' : 'Login'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500"
            required
          />

          {isSignup && (
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500"
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500"
            required
          />



          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-500 hover:underline"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;