const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

// Public route to view menu
router.get('/restaurants/:restaurant_id/menu', foodController.getFoodItemsByRestaurant);

// Protected strictly for Vendors to add food items
router.post('/vendor', authenticateToken, authorizeRole('vendor'), foodController.addFoodItem);

module.exports = router;
