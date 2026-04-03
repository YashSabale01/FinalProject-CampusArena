import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './components/UserProfile';

const AppContent = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => setShowLoginModal(true)} />
      
      <main>
        <Routes>
          <Route path="/" element={user ? (
            user.role === 'Admin' ? <AdminDashboard /> : <StudentDashboard />
          ) : <Home />} />
          <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/" />} />
          <Route path="/events" element={<Home />} />
        </Routes>
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;