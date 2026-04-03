const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../controllers/stripeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/events/:eventId/create-payment-intent', createPaymentIntent);
router.post('/events/:eventId/confirm-payment', confirmPayment);

module.exports = router;