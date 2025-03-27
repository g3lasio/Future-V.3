const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Rutas de administración de usuarios (solo para administradores)
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
router.get('/:id', authenticate, authorize(['admin']), userController.getUserById);
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
router.put('/:id/status', authenticate, authorize(['admin']), userController.toggleUserStatus);

// Rutas de suscripción
router.get('/subscription', authenticate, userController.getSubscriptionDetails);
router.post('/subscription/upgrade', authenticate, userController.upgradeSubscription);
router.post('/subscription/cancel', authenticate, userController.cancelSubscription);
router.post('/subscription/payment-method', authenticate, userController.updatePaymentMethod);

module.exports = router;
