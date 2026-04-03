import React, { useState, useEffect } from "react";
import { eventAPI, stripeAPI, favoritesAPI } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Countdown from '../components/Countdown';
import StripePayment from '../components/StripePayment';
import EventReviews from '../components/EventReviews';
import EventComments from '../components/EventComments';
import '../theme.css';

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  const categories = ["Academic", "Cultural", "Sports", "Technical", "Social"];
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "price") return a.fees - b.fees;
    if (sortBy === "capacity") return b.capacity - a.capacity;
    if (sortBy === "popular") return b.registeredCount - a.registeredCount;
    if (sortBy === "available") return (b.capacity - b.registeredCount) - (a.capacity - a.registeredCount);
    return 0;
  });

  useEffect(() => {
    loadEvents();
    loadRegistrations();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (eventId) => {
    try {
      const response = await favoritesAPI.toggle(eventId);
      loadFavorites();
      alert(response.message || 'Favorite updated');
    } catch (error) {
      alert('Failed to update favorite');
    }
  };

  const isFavorited = (eventId) => {
    return favorites.some(fav => fav.event._id === eventId);
  };

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.events);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const response = await eventAPI.getMyRegistrations();
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error("Failed to load registrations:", error);
    }
  };

  const handleRegister = async (eventId) => {
    const event = events.find((e) => e._id === eventId);
    console.log("Event found:", event);
    console.log("Event fees:", event.fees, "Type:", typeof event.fees);

    if (event.fees > 0) {
      console.log("Redirecting to payment");
      handlePayment(eventId);
    } else {
      console.log("Free registration");
      try {
        await eventAPI.register(eventId);
        loadEvents();
        loadRegistrations();
        alert("Registration successful!");
      } catch (error) {
        alert(error.message || "Registration failed");
      }
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

  const handlePayment = async (eventId) => {
    const event = events.find(e => e._id === eventId);
    setSelectedEventForPayment(event);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      await eventAPI.register(selectedEventForPayment._id);
      setShowPaymentModal(false);
      setSelectedEventForPayment(null);
      loadEvents();
      loadRegistrations();
      alert("Payment successful! Registration confirmed.");
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || "Payment verification failed!");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      await eventAPI.cancelRegistration(eventId);
      loadEvents();
      loadRegistrations();
      alert("Registration cancelled!");
    } catch (error) {
      alert(error.message || "Cancellation failed");
    }
  };

  const isRegistered = (eventId) => {
    return registrations.some((reg) => reg.event._id === eventId);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen transition-colors" style={{backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? '#f9fafb' : '#111827'}}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
            <p className="opacity-90">Discover and register for campus events</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newTheme = !isDark;
                setIsDark(newTheme);
                localStorage.setItem('darkMode', newTheme.toString());
                document.body.style.backgroundColor = newTheme ? '#111827' : '#f9fafb';
              }}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
            </button>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg shadow text-center" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
          <div className="text-2xl font-bold text-blue-600">{events.length}</div>
          <div className="text-sm" style={{color: isDark ? '#d1d5db' : '#6b7280'}}>Total Events</div>
        </div>
        <div className="p-4 rounded-lg shadow text-center" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
          <div className="text-2xl font-bold text-green-600">{registrations.length}</div>
          <div className="text-sm" style={{color: isDark ? '#d1d5db' : '#6b7280'}}>My Registrations</div>
        </div>
        <div className="p-4 rounded-lg shadow text-center" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
          <div className="text-2xl font-bold text-purple-600">
            ₹{registrations.reduce((sum, reg) => sum + (reg.event.fees || 0), 0)}
          </div>
          <div className="text-sm" style={{color: isDark ? '#d1d5db' : '#6b7280'}}>Total Spent</div>
        </div>
        <div className="p-4 rounded-lg shadow text-center" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
          <div className="text-2xl font-bold text-orange-600">
            {registrations.filter(reg => new Date(reg.event.date) > new Date()).length}
          </div>
          <div className="text-sm" style={{color: isDark ? '#d1d5db' : '#6b7280'}}>Upcoming Events</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["events", "registrations", "favorites"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize ${
              activeTab === tab
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "events" && "📅 All Events"}
            {tab === "registrations" && "🎫 My Registrations"}
            {tab === "favorites" && "❤️ Favorites"}
          </button>
        ))}
      </div>

      {activeTab === "events" && (
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="popular">Most Popular</option>
                <option value="available">Most Available</option>
              </select>
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <span>{filteredEvents.length} events found</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  💰 {filteredEvents.filter(e => e.fees > 0).length} Paid
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  🆓 {filteredEvents.filter(e => e.fees === 0).length} Free
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white p-6 rounded-lg shadow border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📅 {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    {new Date(event.date) > new Date() && (
                      <div className="mt-2">
                        <Countdown targetDate={event.date} />
                      </div>
                    )}
                    <p>📍 {event.location}</p>
                    <p>🏷️ {event.category}</p>
                    <p>
                      👥 {event.registeredCount}/{event.capacity} registered
                    </p>
                    <p>💰 {event.fees > 0 ? `₹${event.fees}` : "Free"}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        event.registeredCount >= event.capacity ? 'bg-red-100 text-red-800' :
                        event.registeredCount / event.capacity > 0.8 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.registeredCount >= event.capacity ? '🔴 FULL' :
                         event.registeredCount / event.capacity > 0.8 ? '🟡 FILLING FAST' :
                         '🟢 AVAILABLE'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        new Date(event.date) < new Date() ? 'bg-gray-100 text-gray-600' :
                        new Date(event.date) - new Date() < 24 * 60 * 60 * 1000 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {new Date(event.date) < new Date() ? '⏰ Past Event' :
                         new Date(event.date) - new Date() < 24 * 60 * 60 * 1000 ? '🔥 Tomorrow' :
                         '📅 Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex flex-col space-y-2">
                    {isRegistered(event._id) ? (
                      <button
                        onClick={() => handleCancelRegistration(event._id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded font-medium"
                      >
                        ❌ Cancel Registration
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={event.registeredCount >= event.capacity}
                        className={`px-4 py-2 rounded font-medium ${
                          event.registeredCount >= event.capacity
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : event.fees > 0
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        {event.registeredCount >= event.capacity
                          ? "🚫 Full"
                          : event.fees > 0
                          ? `💳 Pay ₹${event.fees}`
                          : "✅ Register Free"}
                      </button>
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          const eventText = `Check out ${event.title} on ${new Date(event.date).toLocaleDateString()} at ${event.location}`;
                          if (navigator.share) {
                            navigator.share({
                              title: event.title,
                              text: eventText,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(eventText + ' - ' + window.location.href);
                            alert('Event details copied to clipboard!');
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                      >
                        🔗 Share
                      </button>
                      {isRegistered(event._id) && (
                        <button
                          onClick={() => {
                            const ticket = `
=== EVENT TICKET ===

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Time: ${new Date(event.date).toLocaleTimeString()}
Location: ${event.location}
Attendee: ${user.username}
Category: ${event.category}
${event.fees > 0 ? `Fee Paid: ₹${event.fees}` : 'Free Event'}

=== CAMPUSARENA ===
            `;
                            const printWindow = window.open('', '_blank');
                            printWindow.document.write(`
                              <html>
                                <head><title>Event Ticket</title></head>
                                <body style="font-family: monospace; padding: 20px;">
                                  <pre>${ticket}</pre>
                                  <script>window.print(); window.close();</script>
                                </body>
                              </html>
                            `);
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                        >
                          🎫 Print
                        </button>
                      )}
                      <button
                        onClick={() => toggleFavorite(event._id)}
                        className={`px-2 py-1 rounded text-xs ${
                          isFavorited(event._id)
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isFavorited(event._id) ? '❤️ Saved' : '🤍 Save'}
                      </button>
                      <button
                        onClick={() => setActiveTab('discussion-' + event._id)}
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs"
                      >
                        💬 Discuss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found matching your criteria.
            </div>
          )}
          </div>
        </div>
      )}

      {activeTab === "registrations" && (
        <div className="grid gap-4">
          {registrations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No registrations yet.
            </p>
          ) : (
            registrations.map((registration) => (
              <div
                key={registration.event._id}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {registration.event.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  {registration.event.description}
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    📅 {new Date(registration.event.date).toLocaleDateString()} at {new Date(registration.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p>📍 {registration.event.location}</p>
                  <p>
                    ✅ Registered on{" "}
                    {new Date(registration.registeredAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      new Date(registration.event.date) < new Date() ? 'bg-gray-100 text-gray-600' :
                      new Date(registration.event.date) - new Date() < 24 * 60 * 60 * 1000 ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {new Date(registration.event.date) < new Date() ? '✓ Completed' :
                       new Date(registration.event.date) - new Date() < 24 * 60 * 60 * 1000 ? '🔥 Tomorrow!' :
                       '🕰️ Upcoming'}
                    </span>
                    {registration.event.fees > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        💳 Paid ₹{registration.event.fees}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="grid gap-4">
          {favorites.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No favorite events yet. Click the 🤍 Save button on events to add them here!
            </p>
          ) : (
            favorites.map((favorite) => (
              <div
                key={favorite._id}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{favorite.event.title}</h3>
                    <p className="text-gray-600 mb-2">{favorite.event.description}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📅 {new Date(favorite.event.date).toLocaleDateString()}</p>
                      <p>📍 {favorite.event.location}</p>
                      <p>🏷️ {favorite.event.category}</p>
                      <p>💰 {favorite.event.fees > 0 ? `₹${favorite.event.fees}` : "Free"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => toggleFavorite(favorite.event._id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                    >
                      ❌ Remove
                    </button>
                    {!isRegistered(favorite.event._id) && (
                      <button
                        onClick={() => handleRegister(favorite.event._id)}
                        className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab.startsWith('discussion-') && (
        <div>
          <button
            onClick={() => setActiveTab('events')}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Events
          </button>
          {(() => {
            const eventId = activeTab.split('-')[1];
            const event = events.find(e => e._id === eventId);
            const userAttended = registrations.some(reg => 
              reg.event._id === eventId && new Date(reg.event.date) < new Date()
            );
            
            return event ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <EventComments eventId={eventId} />
                <EventReviews eventId={eventId} userAttended={userAttended} />
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedEventForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Payment for {selectedEventForPayment.title}</h3>
            <p className="text-gray-600 mb-4">Amount: ₹{selectedEventForPayment.fees}</p>
            <StripePayment
              eventId={selectedEventForPayment._id}
              amount={selectedEventForPayment.fees}
              onSuccess={() => {
                setShowPaymentModal(false);
                setSelectedEventForPayment(null);
                loadEvents();
                loadRegistrations();
                alert("Payment successful! Registration confirmed.");
              }}
              onCancel={() => {
                setShowPaymentModal(false);
                setSelectedEventForPayment(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
