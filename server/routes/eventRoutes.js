const express = require('express');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
} = require('../controllers/eventController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

const router = express.Router();

router.get('/', getEvents);
router.get('/my-registrations', protect, getMyRegistrations);


router.post('/', protect, admin, upload.single('poster'), createEvent);
router.put('/:id', protect, admin, upload.single('poster'), updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;