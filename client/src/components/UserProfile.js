import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, eventAPI } from '../api/axiosInstance';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    bio: '',
    profileImage: null,
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'Student'
  });
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const [profileRes, registrationsRes] = await Promise.all([
        userAPI.getProfile?.() || Promise.resolve({ data: { user } }),
        eventAPI.getMyRegistrations()
      ]);
      
      setProfile({
        bio: profileRes.data?.user?.bio || '',
        profileImage: profileRes.data?.user?.profileImage || null,
        username: user?.username || '',
        email: user?.email || '',
        role: user?.role || 'Student'
      });
      setRegistrations(registrationsRes.registrations || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);



  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                profile.username?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>

          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              profile.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {profile.role}
            </span>
          </div>
        </div>


      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Event History ({registrations?.length || 0})</h2>
        
        {!registrations || registrations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No event registrations yet</p>
        ) : (
          <div className="space-y-4">
            {(registrations || []).map((reg) => (
              <div key={reg._id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{reg.event.title}</h3>
                  <p className="text-sm text-gray-600">{reg.event.category} • {reg.event.location}</p>
                  <p className="text-sm text-gray-500">
                    Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    new Date(reg.event.date) < new Date() 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {new Date(reg.event.date) < new Date() ? 'Completed' : 'Upcoming'}
                  </span>
                  <p className="text-sm font-medium mt-1">
                    {reg.event.fees > 0 ? `₹${reg.event.fees}` : 'Free'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;