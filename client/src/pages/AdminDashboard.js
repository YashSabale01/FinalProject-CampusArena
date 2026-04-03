import React, { useState, useEffect, useCallback } from "react";
import { eventAPI, userAPI } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  const { user } = useAuth();

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Academic",
    capacity: "",
    fees: "0",
  });

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Student",
  });

  const loadData = useCallback(async () => {
    try {
      if (activeTab === "events") {
        const response = await eventAPI.getAll();
        setEvents(response.data.events);
      } else if (activeTab === "users") {
        const response = await userAPI.getAll();
        setUsers(response.data.users);
      } else if (activeTab === "stats") {
        const response = await userAPI.getStats();
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      
      const eventData = {
        ...eventForm,
        fees: parseFloat(eventForm.fees) || 0,
        capacity: parseInt(eventForm.capacity),
      };
      await eventAPI.create(eventData);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "Academic",
        capacity: "",
        fees: "0",
      });
      loadData();
      alert("Event created successfully!");
    } catch (error) {
      console.error('Create event error:', error);
      alert(error.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventAPI.delete(eventId);
        loadData();
        alert("Event deleted successfully!");
      } catch (error) {
        alert(error.message || "Failed to delete event");
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(userForm);
      setUserForm({
        username: "",
        email: "",
        password: "",
        role: "Student",
      });
      loadData();
      alert("User created successfully!");
    } catch (error) {
      alert(error.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userAPI.delete(userId);
        loadData();
        alert("User deleted successfully!");
      } catch (error) {
        alert(error.message || "Failed to delete user");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen" style={{backgroundColor: isDark ? '#111827' : '#f9fafb', color: isDark ? '#f9fafb' : '#111827'}}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90">Welcome back, {user.username}!</p>
          </div>
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
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["events", "users", "stats", "analytics", "export"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize ${
              activeTab === tab
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "events" && "📅 Events"}
            {tab === "users" && "👥 Users"}
            {tab === "stats" && "📊 Stats"}
            {tab === "analytics" && "📈 Analytics"}
            {tab === "export" && "📊 Export"}
          </button>
        ))}
      </div>

      {activeTab === "events" && (
        <div>
          <div className="p-6 rounded-lg shadow mb-6" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
            <h2 className="text-xl font-semibold mb-4" style={{color: isDark ? '#f9fafb' : '#111827'}}>Create New Event</h2>
            <form
              onSubmit={handleCreateEvent}
              className="grid grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Event Title"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <select
                value={eventForm.category}
                onChange={(e) =>
                  setEventForm({ ...eventForm, category: e.target.value })
                }
                className="p-3 border rounded"
              >
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Technical">Technical</option>
                <option value="Social">Social</option>
              </select>
              <textarea
                placeholder="Description"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
                className="p-3 border rounded col-span-2"
                rows="3"
                required
              />
              <input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) =>
                  setEventForm({ ...eventForm, date: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={eventForm.capacity}
                onChange={(e) =>
                  setEventForm({ ...eventForm, capacity: e.target.value })
                }
                className="p-3 border rounded"
                required
                min="1"
              />
              <input
                type="number"
                placeholder="Fees (₹0 for free)"
                value={eventForm.fees}
                onChange={(e) =>
                  setEventForm({ ...eventForm, fees: e.target.value })
                }
                className="p-3 border rounded"
                required
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                className="bg-indigo-500 text-white p-3 rounded hover:bg-indigo-600 col-span-2"
              >
                Create Event
              </button>
            </form>
          </div>

          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-6 rounded-lg shadow border"
                style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                      <p>📍 {event.location}</p>
                      <p>
                        👥 {event.registeredCount}/{event.capacity} registered
                      </p>
                      <p>
                        💰{" "}
                        {event.fees && event.fees > 0
                          ? `₹${event.fees}`
                          : "Free"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => {
                        const eventData = `Event: ${event.title}\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}\nRegistered: ${event.registeredCount}/${event.capacity}`;
                        navigator.clipboard.writeText(eventData);
                        alert('Event details copied!');
                      }}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                    >
                      📋 Copy Details
                    </button>
                    <button
                      onClick={() => {
                        if (!event.registeredUsers || event.registeredUsers.length === 0) {
                          alert('No registrations for this event');
                          return;
                        }
                        
                        // User mapping
                        const userMap = {
                          "6916c1991df31d4aa2908872": { username: "admin1", email: "admin1@campusarena.com" },
                          "6916c1991df31d4aa2908873": { username: "admin2", email: "admin2@campusarena.com" },
                          "6916c1991df31d4aa2908874": { username: "john_doe", email: "john@student.com" },
                          "6916c1991df31d4aa2908875": { username: "jane_smith", email: "jane@student.com" },
                          "6916c1991df31d4aa2908876": { username: "mike_wilson", email: "mike@student.com" }
                        };
                        
                        const csv = `Username,Email,Registration Date,Payment Status\n${event.registeredUsers.map(reg => {
                          const userId = reg.user.toString();
                          const user = userMap[userId] || { username: 'Unknown', email: 'Unknown' };
                          const date = new Date(reg.registeredAt).toISOString().split('T')[0];
                          return `"${user.username}","${user.email}","${date}","${reg.paymentStatus || 'N/A'}"`;
                        }).join('\n')}`;
                        
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
                        link.click();
                      }}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                    >
                      📊 Export CSV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <div className="p-6 rounded-lg shadow mb-6" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
            <h2 className="text-xl font-semibold mb-4" style={{color: isDark ? '#f9fafb' : '#111827'}}>Create New User</h2>
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Username"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm({ ...userForm, username: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                className="p-3 border rounded"
                required
              />
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
                className="p-3 border rounded"
              >
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-500 text-white p-3 rounded hover:bg-indigo-600 col-span-2"
              >
                Create User
              </button>
            </form>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-6 rounded-lg shadow border"
                style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${user.username} - ${user.email}`);
                        alert('User details copied!');
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg shadow text-center" style={{backgroundColor: isDark ? '#374151' : '#ffffff'}}>
            <h3 className="text-2xl font-bold text-indigo-600">
              {stats.totalUsers}
            </h3>
            <p style={{color: isDark ? '#d1d5db' : '#6b7280'}}>Total Users</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {stats.totalStudents}
            </h3>
            <p className="text-gray-600">Students</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold text-purple-600">
              {stats.totalAdmins}
            </h3>
            <p className="text-gray-600">Admins</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold text-blue-600">
              {stats.totalEvents}
            </h3>
            <p className="text-gray-600">Total Events</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold text-orange-600">
              {stats.activeEvents}
            </h3>
            <p className="text-gray-600">Active Events</p>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">₹{events.reduce((sum, event) => sum + (event.fees * event.registeredCount || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="text-2xl">🎫</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Registrations</p>
                  <p className="text-2xl font-bold">{events.reduce((sum, event) => sum + (event.registeredCount || 0), 0)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Event Performance</h3>
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => {
                const fillRate = (event.registeredCount / event.capacity) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.registeredCount}/{event.capacity} registered</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${fillRate}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(fillRate)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Data Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const csv = `Title,Date,Location,Category,Capacity,Registered,Revenue\n${events.map(e => 
                    `"${e.title}","${new Date(e.date).toLocaleDateString()}","${e.location}","${e.category}",${e.capacity},${e.registeredUsers?.length || 0},${(e.fees || 0) * (e.registeredUsers?.length || 0)}`
                  ).join('\n')}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'all_events.csv';
                  link.click();
                }}
                className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📅 Export All Events
              </button>
              <button
                onClick={() => {
                  const csv = `Username,Email,Role,Created Date\n${users.map(u => 
                    `"${u.username}","${u.email}","${u.role}","${new Date(u.createdAt || Date.now()).toLocaleDateString()}"`
                  ).join('\n')}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'all_users.csv';
                  link.click();
                }}
                className="p-4 bg-green-500 text-white rounded hover:bg-green-600"
              >
                👥 Export All Users
              </button>
              <button
                onClick={() => {
                  const report = `CampusArena Report - ${new Date().toLocaleDateString()}\n\nSUMMARY:\nTotal Events: ${events.length}\nTotal Users: ${users.length}\nTotal Revenue: ₹${events.reduce((sum, e) => sum + ((e.fees || 0) * (e.registeredCount || 0)), 0)}\n\nTOP EVENTS:\n${events.sort((a,b) => (b.registeredCount || 0) - (a.registeredCount || 0)).slice(0,5).map((e, i) => `${i+1}. ${e.title} (${e.registeredCount}/${e.capacity})`).join('\n')}`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'campus_report.txt';
                  link.click();
                }}
                className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                📊 Generate Report
              </button>
              <button
                onClick={() => {
                  const backup = JSON.stringify({ events, users, exportDate: new Date() }, null, 2);
                  const blob = new Blob([backup], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="p-4 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                💾 Backup Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
