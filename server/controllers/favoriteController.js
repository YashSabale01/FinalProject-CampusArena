const Favorite = require('../models/Favorite');
const Event = require('../models/Event');

const toggleFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({ user: userId, event: eventId });

    if (existingFavorite) {
      await Favorite.deleteOne({ _id: existingFavorite._id });
      res.json({ success: true, favorited: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user: userId, event: eventId });
      res.json({ success: true, favorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ user: userId })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleFavorite, getFavorites };