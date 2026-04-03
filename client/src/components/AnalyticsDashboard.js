import React, { useState, useEffect } from 'react';
import { userAPI, eventAPI } from '../api/axiosInstance';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get real stats
      const [statsRes, eventsRes] = await Promise.all([
        userAPI.getStats?.() || Promise.resolve({ data: { totalUsers: 0, totalEvents: 0 } }),
        eventAPI.getAll()
      ]);
      
      const events = eventsRes.events || [];
      
      // Calculate trends
      const trendData = events.map(event => ({
        name: event.title,
        registrations: event.registeredUsers?.length || 0,
        capacity: event.capacity,
        fillRate: Math.round(((event.registeredUsers?.length || 0) / event.capacity) * 100)
      })).sort((a, b) => b.registrations - a.registrations);
      
      setTrends(trendData.slice(0, 5));
      setPopularEvents(events.filter(e => e.registeredUsers?.length > 0)
        .sort((a, b) => (b.registeredUsers?.length || 0) - (a.registeredUsers?.length || 0))
        .slice(0, 3));
      
      const mockStats = {
        overview: {
          totalEvents: 45,
          activeEvents: 12,
          totalUsers: 1250,
          totalRevenue: 125000,
          newUsersThisMonth: 89,
          newEventsThisMonth: 8
        },
        categoryStats: [
          { _id: 'Technical', count: 15, avgRating: 4.5 },
          { _id: 'Cultural', count: 12, avgRating: 4.2 },
          { _id: 'Sports', count: 10, avgRating: 4.0 },
          { _id: 'Academic', count: 8, avgRating: 4.3 }
        ],
        revenueByMonth: [
          { _id: { month: 1, year: 2024 }, revenue: 15000, count: 5 },
          { _id: { month: 2, year: 2024 }, revenue: 22000, count: 8 },
          { _id: { month: 3, year: 2024 }, revenue: 18000, count: 6 }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalEvents}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm">+{stats.overview.newEventsThisMonth} this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              👥
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm">+{stats.overview.newUsersThisMonth} this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
        <div className="space-y-4">
          {stats.categoryStats.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-500 rounded mr-3"></div>
                <span className="font-medium">{category._id}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{category.count} events</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 text-sm">{category.avgRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <div className="space-y-3">
          {stats.revenueByMonth.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{width: `${(month.revenue / 25000) * 100}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium">₹{month.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📈 Registration Trends</h3>
          <div className="space-y-3">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{trend.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${trend.fillRate}%`}}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-bold">{trend.registrations}/{trend.capacity}</p>
                  <p className="text-xs text-gray-500">{trend.fillRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🏆 Popular Events</h3>
          <div className="space-y-4">
            {popularEvents.map((event, index) => (
              <div key={event._id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{event.registeredUsers?.length || 0}</p>
                  <p className="text-xs text-gray-500">registrations</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;