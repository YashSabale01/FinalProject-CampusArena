const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStats
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, upload.single('profileImage'), updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getStats);

module.exports = router;