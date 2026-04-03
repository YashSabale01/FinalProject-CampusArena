import React, { useState, useEffect } from 'react';

const EventCalendar = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    // Group events by date
    const eventsByDate = events.reduce((acc, event) => {
      const date = new Date(event.date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
    setCalendarEvents(eventsByDate);
  }, [events]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2 h-20"></div>;
          }

          const dayEvents = calendarEvents[day.toDateString()] || [];
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`p-2 h-20 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                isToday ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => dayEvents.length > 0 && onEventClick(dayEvents)}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              {dayEvents.slice(0, 2).map((event, i) => (
                <div
                  key={i}
                  className="text-xs bg-indigo-100 text-indigo-800 px-1 rounded mt-1 truncate"
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCalendar;