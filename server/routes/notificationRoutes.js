const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:notificationId/read', markAsRead);

module.exports = router;