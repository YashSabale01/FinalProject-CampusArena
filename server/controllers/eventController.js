const Event = require("../models/Event");
const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") filter.category = category;
    if (search) filter.$text = { $search: search };

    const events = await Event.find(filter)
      .select("+fees +isPaid")
      .populate("organizer", "username")
      .populate({
        path: "registeredUsers.user",
        select: "username email"
      })
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    const events = await Event.find(filter)({
      status: "success",
      data: {
        events,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(eventData);
    await event.populate("organizer", "username");

    res.status(201).json({
      status: "success",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const updateData = req.body;
    if (req.file) updateData.poster = req.file.path;

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("organizer", "username");

    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    res.json({ status: "success", data: { event } });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }
    res.json({ status: "success", message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    const isRegistered = event.registeredUsers.some(
      (reg) => reg.user.toString() === req.user._id.toString()
    );

    if (isRegistered) {
      return res
        .status(400)
        .json({ status: "error", message: "Already registered" });
    }

    if (event.registeredUsers.length >= event.capacity) {
      return res
        .status(400)
        .json({ status: "error", message: "Event is full" });
    }

    event.registeredUsers.push({
      user: req.user._id,
      paymentStatus: event.fees > 0 ? "pending" : "completed",
      amountPaid: 0,
    });
    await event.save();

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`event-${req.params.id}`).emit('notification', {
        type: 'registration',
        message: `Someone registered for ${event.title}`,
        eventId: req.params.id,
        spotsLeft: event.capacity - event.registeredUsers.length
      });
    }

    res
      .status(201)
      .json({ status: "success", message: "Registration successful" });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    event.registeredUsers = event.registeredUsers.filter(
      (reg) => reg.user.toString() !== req.user._id.toString()
    );
    await event.save();

    res.json({ status: "success", message: "Registration cancelled" });
  } catch (error) {
    next(error);
  }
};

const getMyRegistrations = async (req, res, next) => {
  try {
    const events = await Event.find({
      "registeredUsers.user": req.user._id,
      isActive: true,
    }).populate("organizer", "username");

    const registrations = events.map((event) => ({
      event,
      registeredAt: event.registeredUsers.find(
        (reg) => reg.user.toString() === req.user._id.toString()
      ).registeredAt,
    }));

    res.json({ status: "success", data: { registrations } });
  } catch (error) {
    next(error);
  }
};

const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredUsers.user', 'username email')
      .select('title registeredUsers');

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    res.json({ 
      status: 'success', 
      data: { 
        eventTitle: event.title,
        registrations: event.registeredUsers 
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
};
