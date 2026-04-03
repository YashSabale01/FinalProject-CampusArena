import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLoginClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center h-16">
        <button 
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
        >
          CampusArena
        </button>
        
        {user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.username}</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;