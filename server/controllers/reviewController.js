const Review = require('../models/Review');
const Event = require('../models/Event');

const createReview = async (req, res) => {
  try {
    const eventId = req.params.eventId || req.body.event;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user attended the event
    const event = await Event.findById(eventId);
    const attended = event.registeredUsers.some(reg => 
      reg.user.toString() === userId.toString() && new Date(event.date) < new Date()
    );

    if (!attended) {
      return res.status(400).json({ message: 'You can only review events you attended' });
    }

    const review = await Review.create({
      event: eventId,
      user: userId,
      rating,
      comment,
      isVerified: true
    });

    await review.populate('user', 'username');
    res.json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const reviews = await Review.find({ event: eventId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({ 
      success: true, 
      reviews, 
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    const isHelpful = review.helpful.includes(userId);

    if (isHelpful) {
      review.helpful.pull(userId);
    } else {
      review.helpful.push(userId);
    }

    await review.save();
    res.json({ success: true, helpful: !isHelpful, count: review.helpful.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getEventReviews, toggleHelpful };