const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/plans', subscriptionController.getPlans);

// Rutas protegidas (requieren autenticación)
router.get('/my-subscription', authMiddleware.protect, subscriptionController.getMySubscription);
router.post('/subscribe', authMiddleware.protect, subscriptionController.subscribe);
router.post('/cancel', authMiddleware.protect, subscriptionController.cancelSubscription);
router.post('/change-plan', authMiddleware.protect, subscriptionController.changePlan);
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
