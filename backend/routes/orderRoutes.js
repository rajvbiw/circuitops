const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT } = require('../middlewares/auth');

// Apply JWT authentication to all address and order routes
router.use(authenticateJWT);

// Address Management
router.get('/addresses', orderController.getAddresses);
router.post('/addresses', orderController.addAddress);
router.delete('/addresses/:id', orderController.deleteAddress);
router.put('/addresses/:id/default', orderController.setDefaultAddress);

// Coupons check
router.post('/coupon/validate', orderController.validateCoupon);

// Orders & Checkout Actions
router.post('/checkout', orderController.checkoutOrder);
router.post('/payment/verify', orderController.verifyPayment);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderDetails);

module.exports = router;
