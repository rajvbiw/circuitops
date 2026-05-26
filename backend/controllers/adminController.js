const db = require('../config/db');

// Get Dashboard Analytics
async function getAnalytics(req, res, next) {
  try {
    // 1. Total Paid Revenue
    const revenueRes = await db.query("SELECT SUM(total_amount) as totalSales FROM orders WHERE payment_status = 'paid'");
    const totalSales = parseFloat(revenueRes[0].totalSales || 0);

    // 2. Counts
    const orderCountRes = await db.query('SELECT COUNT(id) as cnt FROM orders');
    const productCountRes = await db.query('SELECT COUNT(id) as cnt FROM products WHERE status = \'active\'');
    const userCountRes = await db.query('SELECT COUNT(id) as cnt FROM users WHERE role = \'customer\'');

    const totalOrders = orderCountRes[0].cnt;
    const totalProducts = productCountRes[0].cnt;
    const totalUsers = userCountRes[0].cnt;

    // 3. Category distribution
    const categoryStats = await db.query(`
      SELECT c.name as name, COUNT(p.id) as value
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
    `);

    // 4. Recent Orders
    const recentOrders = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.payment_status, o.shipping_status, o.created_at, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      analytics: {
        totalSales,
        totalOrders,
        totalProducts,
        totalUsers,
        categoryStats,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get Warehouse Inventory Levels
async function getInventory(req, res, next) {
  try {
    const inventory = await db.query(`
      SELECT p.id as product_id, p.name, p.price, p.stock_quantity, i.bin_location, i.safety_stock, i.last_restocked
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      ORDER BY p.stock_quantity ASC
    `);

    res.status(200).json({ success: true, inventory });
  } catch (error) {
    next(error);
  }
}

// Get All Users (Admin list)
async function getUsers(req, res, next) {
  try {
    const users = await db.query('SELECT id, name, email, role, google_id, created_at FROM users ORDER BY created_at DESC');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
}

// Update Shipping Status
async function updateOrderStatus(req, res, next) {
  const { id } = req.params;
  const { shipping_status } = req.body;

  if (!shipping_status) {
    return res.status(400).json({ success: false, message: 'Shipping status option is required.' });
  }

  try {
    const orders = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await db.query('UPDATE orders SET shipping_status = ? WHERE id = ?', [shipping_status, id]);
    res.status(200).json({ success: true, message: 'Order shipping status updated.' });
  } catch (error) {
    next(error);
  }
}

// Coupon Administration
async function getCoupons(req, res, next) {
  try {
    const coupons = await db.query('SELECT * FROM coupons ORDER BY active_until DESC');
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
}

async function createCoupon(req, res, next) {
  const { code, discount_type, discount_value, min_order_value, active_until } = req.body;

  if (!code || !discount_type || !discount_value || !active_until) {
    return res.status(400).json({ success: false, message: 'Please specify code, type, value, and expiration date.' });
  }

  try {
    const existing = await db.query('SELECT id FROM coupons WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    await db.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_value, active_until, is_active)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `, [code, discount_type, discount_value, min_order_value || 0.00, active_until]);

    res.status(201).json({ success: true, message: 'Coupon campaign created!' });
  } catch (error) {
    next(error);
  }
}

async function deleteCoupon(req, res, next) {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalytics,
  getInventory,
  getUsers,
  updateOrderStatus,
  getCoupons,
  createCoupon,
  deleteCoupon
};
