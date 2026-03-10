const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { enforceAdminRegistrationLimit } = require('../middleware/roleMiddleware');

router.post('/register', enforceAdminRegistrationLimit, authController.register);
router.post('/login', authController.login);

module.exports = router;
