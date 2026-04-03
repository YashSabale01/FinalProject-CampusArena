const express = require('express');
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/:eventId', protect, toggleFavorite);
router.get('/', protect, getFavorites);

module.exports = router;