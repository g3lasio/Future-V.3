const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/apple', authController.loginWithApple);
router.post('/login/github', authController.loginWithGithub);
router.post('/login/phone/start', authController.startPhoneAuth);
router.post('/login/phone/verify', authController.verifyPhoneCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Rutas protegidas (requieren autenticación)
router.get('/me', authMiddleware.protect, authController.getProfile);
router.put('/me', authMiddleware.protect, authController.updateProfile);
router.post('/change-password', authMiddleware.protect, authController.changePassword);
router.post('/resend-verification', authMiddleware.protect, authController.resendVerificationEmail);
router.post('/logout', authMiddleware.protect, authController.logout);

module.exports = router;
