const Comment = require('../models/Comment');

const createComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.create({
      event: eventId,
      user: userId,
      text
    });

    await comment.populate('user', 'username');
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const comments = await Comment.find({ event: eventId })
      .populate('user', 'username')
      .populate('replies.user', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ success: true, liked: !isLiked, count: comment.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    comment.replies.push({
      user: userId,
      text
    });

    await comment.save();
    await comment.populate('replies.user', 'username');
    
    res.json({ success: true, reply: comment.replies[comment.replies.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComment, getEventComments, toggleLike, addReply };