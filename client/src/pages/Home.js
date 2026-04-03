import React, { useState, useEffect } from 'react';
import { eventAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import AdvancedSearch from '../components/AdvancedSearch';
import useSocket from '../hooks/useSocket';

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const { notifications } = useSocket();

  useEffect(() => {
    loadEvents();
    if (user) loadRegistrations();
  }, [user]);

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      const eventsData = response.events || [];
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const response = await eventAPI.getMyRegistrations();
      const registered = new Set(response.registrations?.map(r => r.event._id) || []);
      setRegisteredEvents(registered);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  };

  const handleSearch = (filters) => {
    let filtered = events;
    
    if (filters.search) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(filters.dateTo));
    }
    
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.fees === 'free') {
      filtered = filtered.filter(event => event.fees === 0);
    } else if (filters.fees === 'paid') {
      filtered = filtered.filter(event => event.fees > 0);
    }
    
    if (filters.availability === 'available') {
      filtered = filtered.filter(event => (event.registeredUsers?.length || 0) < event.capacity);
    } else if (filters.availability === 'full') {
      filtered = filtered.filter(event => (event.registeredUsers?.length || 0) >= event.capacity);
    }
    
    setFilteredEvents(filtered);
  };

  const handleResetSearch = () => {
    setFilteredEvents(events);
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      alert('Please login to register for events');
      return;
    }
    
    try {
      await eventAPI.register(eventId);
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      loadEvents();
      alert('Registration successful!');
    } catch (error) {
      alert(error.message || 'Registration failed');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await eventAPI.cancelRegistration(eventId);
      setRegisteredEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      loadEvents();
      alert('Registration cancelled');
    } catch (error) {
      alert(error.message || 'Cancellation failed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6">CampusArena</h1>
          <p className="text-xl mb-8 opacity-90">
            Campus Event Management Platform
          </p>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <p className="text-lg mb-4">Welcome to CampusArena</p>
            <p className="opacity-80">
              Discover and register for campus events. Click Login to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Campus Events</h1>
          <p className="text-gray-600">Discover and join amazing events happening on campus</p>
        </div>

        <AdvancedSearch onSearch={handleSearch} onReset={handleResetSearch} />

        {notifications.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">🔔 {notifications[0].message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventWithCount = {
              ...event,
              registeredCount: event.registeredUsers?.length || 0
            };
            
            return (
              <EventCard
                key={event._id}
                event={eventWithCount}
                onRegister={handleRegister}
                onCancel={handleCancel}
                isRegistered={registeredEvents.has(event._id)}
              />
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;