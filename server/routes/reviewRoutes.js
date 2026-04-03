const express = require('express');
const { createReview, getEventReviews, toggleHelpful } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.post('/event/:eventId', protect, createReview);
router.get('/event/:eventId', getEventReviews);
router.post('/:reviewId/helpful', protect, toggleHelpful);

module.exports = router;