const express = require('express');
const router = express.Router();
const cartWishlistController = require('../controllers/cartWishlistController');
const { authenticateJWT } = require('../middlewares/auth');

// Apply JWT authentication to all cart/wishlist routes
router.use(authenticateJWT);

// Cart Endpoints
router.get('/cart', cartWishlistController.getCart);
router.post('/cart', cartWishlistController.addToCart);
router.put('/cart', cartWishlistController.updateCartQuantity);
router.delete('/cart/:productId', cartWishlistController.removeFromCart);
router.delete('/cart', cartWishlistController.clearCart);

// Wishlist Endpoints
router.get('/wishlist', cartWishlistController.getWishlist);
router.post('/wishlist', cartWishlistController.addToWishlist);
router.delete('/wishlist/:productId', cartWishlistController.removeFromWishlist);

module.exports = router;
