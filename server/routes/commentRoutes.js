const express = require('express');
const { createComment, getEventComments, toggleLike, addReply } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/event/:eventId', protect, createComment);
router.get('/event/:eventId', getEventComments);
router.post('/:commentId/like', protect, toggleLike);
router.post('/:commentId/reply', protect, addReply);

module.exports = router;