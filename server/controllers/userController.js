const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const filter = {};
    
    if (role && role !== 'All') filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const user = await User.create({ username, email, password, role });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    console.log('Update user request:', {
      userId: req.params.id,
      body: req.body,
      file: req.file ? req.file.filename : 'No file'
    });

    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    console.log('Update data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    console.log('Updated user:', user);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });

    const Event = require('../models/Event');
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ 
      date: { $gte: new Date() },
      isActive: true 
    });

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalEvents,
          activeEvents
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStats
};