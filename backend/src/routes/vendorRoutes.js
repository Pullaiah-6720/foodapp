const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(authorizeRole('vendor'));

router.post('/restaurants', vendorController.submitRestaurant);
router.get('/restaurants/my', vendorController.getVendorRestaurant);

module.exports = router;
