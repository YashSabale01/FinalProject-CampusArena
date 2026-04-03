const User = require('../models/User');
const Event = require('../models/Event');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get user's registered events
    const events = await Event.find({
      'registeredUsers.user': userId
    }).populate('organizer', 'username');

    const notifications = [];

    // Event reminders (24 hours before)
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const timeDiff = eventDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff > 0 && hoursDiff <= 24) {
        notifications.push({
          id: `reminder_${event._id}`,
          type: 'reminder',
          title: 'Event Reminder',
          message: `${event.title} is starting in ${Math.round(hoursDiff)} hours`,
          eventId: event._id,
          createdAt: new Date()
        });
      }
    });

    res.json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    
    // In a real app, you'd store notifications in database
    // For now, just return success
    
    res.json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead };