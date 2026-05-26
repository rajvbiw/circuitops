const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

// Apply Admin check to all admin dashboard subroutes
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

// Admin Dashboard stats
router.get('/analytics', adminController.getAnalytics);
router.get('/inventory', adminController.getInventory);
router.get('/users', adminController.getUsers);

// Order logistics updates
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Coupon Administration CRUD
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

module.exports = router;
