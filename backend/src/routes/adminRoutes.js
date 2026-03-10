const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/restaurants', adminController.getAllRestaurants);
router.get('/restaurants/pending', adminController.getPendingRestaurants);
router.patch('/restaurants/:id/approve', adminController.approveRestaurant);
router.patch('/restaurants/:id/reject', adminController.rejectRestaurant);

router.get('/customers', adminController.getAllCustomers);
router.get('/vendors', adminController.getAllVendors);

module.exports = router;
