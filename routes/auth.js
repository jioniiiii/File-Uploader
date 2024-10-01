const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/log-in', authController.logInGet);
router.post('/log-in', authController.logInPost);

router.get('/sign-up', authController.signUpGet);
router.post('/sign-up', authController.signUpPost);

router.get('/log-out', authController.logOut);

module.exports = router;