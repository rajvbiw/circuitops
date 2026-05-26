const db = require('../config/db');

// --- Cart Operations ---

// Get Cart Items
async function getCart(req, res, next) {
  const userId = req.user.id;
  try {
    const items = await db.query(`
      SELECT c.id, c.product_id, c.quantity, p.name, p.slug, p.price, p.discount_price, p.image_url, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
    res.status(200).json({ success: true, cart: items });
  } catch (error) {
    next(error);
  }
}

// Add Item to Cart
async function addToCart(req, res, next) {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // 1. Check if product exists & has enough stock
    const products = await db.query('SELECT name, stock_quantity FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];

    // 2. Check if product already in cart
    const cartItems = await db.query('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);

    let newQty = qty;
    if (cartItems.length > 0) {
      newQty = cartItems[0].quantity + qty;
    }

    if (product.stock_quantity < newQty) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot add. Stock limit reached. Only ${product.stock_quantity} available.` 
      });
    }

    if (cartItems.length > 0) {
      // Update quantity
      await db.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, cartItems[0].id]);
    } else {
      // Insert new
      await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, qty]);
    }

    res.status(200).json({ success: true, message: `Added ${product.name} to cart.` });
  } catch (error) {
    next(error);
  }
}

// Update Cart Item Quantity
async function updateCartQuantity(req, res, next) {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!productId || qty === undefined || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Product ID and positive quantity are required.' });
  }

  try {
    const products = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (products[0].stock_quantity < qty) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update. Stock limit reached. Only ${products[0].stock_quantity} available.` 
      });
    }

    await db.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [qty, userId, productId]);
    res.status(200).json({ success: true, message: 'Cart quantity updated.' });
  } catch (error) {
    next(error);
  }
}

// Remove Item from Cart
async function removeFromCart(req, res, next) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
}

// Clear Cart
async function clearCart(req, res, next) {
  const userId = req.user.id;
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
}

// --- Wishlist Operations ---

// Get Wishlist
async function getWishlist(req, res, next) {
  const userId = req.user.id;
  try {
    const list = await db.query(`
      SELECT w.id, w.product_id, p.name, p.slug, p.price, p.discount_price, p.image_url, p.stock_quantity
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [userId]);
    res.status(200).json({ success: true, wishlist: list });
  } catch (error) {
    next(error);
  }
}

// Add to Wishlist
async function addToWishlist(req, res, next) {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // Check if product exists
    const prod = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (prod.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if already wishlisted
    const existing = await db.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: 'Product already in wishlist.' });
    }

    await db.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    res.status(201).json({ success: true, message: 'Added to wishlist.' });
  } catch (error) {
    next(error);
  }
}

// Remove from Wishlist
async function removeFromWishlist(req, res, next) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    await db.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.status(200).json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
