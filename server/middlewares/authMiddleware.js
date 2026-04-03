const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, admin };