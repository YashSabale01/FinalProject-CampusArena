const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    // Force role to be Student for public signup
    const user = await User.create({ username, email, password, role: 'Student' });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      data: {
        token,
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

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide username and password' });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      status: 'success',
      data: {
        token,
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

const getProfile = async (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user }
  });
};

module.exports = { signup, login, getProfile };