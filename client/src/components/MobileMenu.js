import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'Events', icon: '📅', path: '/events' },
    { name: 'My Registrations', icon: '🎫', path: '/registrations' },
    { name: 'Calendar', icon: '📆', path: '/calendar' },
    { name: 'Profile', icon: '👤', path: '/profile' },
    { name: 'Notifications', icon: '🔔', path: '/notifications' }
  ];

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-semibold">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.path}
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center p-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-xl mr-3">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;