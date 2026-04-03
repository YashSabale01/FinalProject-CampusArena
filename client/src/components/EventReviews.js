import React, { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../api/axiosInstance';

const EventReviews = ({ eventId, userAttended }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const loadReviews = useCallback(async () => {
    try {
      const response = await reviewsAPI.getByEvent(eventId);
      setReviews(response.reviews);
      setAvgRating(response.avgRating);
      setTotalReviews(response.totalReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  }, [eventId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submitReview = async () => {
    try {
      await reviewsAPI.create({ ...newReview, event: eventId });
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      loadReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.message || 'Failed to submit review');
    }
  };

  const toggleHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Failed to toggle helpful:', error);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
          {totalReviews > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{renderStars(Math.round(avgRating))}</span>
              <span className="text-lg font-medium">{avgRating}</span>
              <span className="text-gray-500">({totalReviews} reviews)</span>
            </div>
          )}
        </div>
        {userAttended && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ⭐ Write Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
              className="border rounded px-3 py-2"
            >
              {[5,4,3,2,1].map(num => (
                <option key={num} value={num}>{renderStars(num)} ({num} stars)</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Share your experience..."
              maxLength={500}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={submitReview}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{review.user.username}</span>
                  <span className="text-lg">{renderStars(review.rating)}</span>
                  {review.isVerified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => toggleHelpful(review._id)}
                    className="hover:text-blue-600"
                  >
                    👍 Helpful ({review.helpful?.length || 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No reviews yet. Be the first to review this event!
          </p>
        )}
      </div>
    </div>
  );
};

export default EventReviews;