const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

// Public Product Routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:slug', productController.getProductBySlug);

// Private Review writing
router.post('/review', authenticateJWT, productController.addReview);

// Admin Specific Product CRUD
router.post('/', authenticateJWT, authorizeRoles('admin'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;
