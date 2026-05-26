const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/db');

// Instantiate Razorpay
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
let razorpayInstance = null;

if (isRazorpayConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('💳 Razorpay initialized successfully.');
} else {
  console.log('ℹ️ Razorpay credentials not configured. Running in Payment Sandbox Simulation Mode.');
}

// --- Address Management ---

async function getAddresses(req, res, next) {
  const userId = req.user.id;
  try {
    const addresses = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
}

async function addAddress(req, res, next) {
  const userId = req.user.id;
  const { name, phone, street, city, state, pin_code, is_default } = req.body;

  if (!name || !phone || !street || !city || !state || !pin_code) {
    return res.status(400).json({ success: false, message: 'Please fill all address fields.' });
  }

  try {
    const isDefaultBool = is_default ? 1 : 0;
    
    if (isDefaultBool === 1) {
      // Toggle off other default addresses
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const result = await db.query(`
      INSERT INTO addresses (user_id, name, phone, street, city, state, pin_code, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, phone, street, city, state, pin_code, isDefaultBool]);

    res.status(201).json({ success: true, message: 'Address added successfully!', addressId: result.insertId });
  } catch (error) {
    next(error);
  }
}

async function deleteAddress(req, res, next) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    next(error);
  }
}

async function setDefaultAddress(req, res, next) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    await db.query('UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ success: true, message: 'Default address updated.' });
  } catch (error) {
    next(error);
  }
}

// --- Coupon Logic ---

async function validateCoupon(req, res, next) {
  const { code, cartAmount } = req.body;

  if (!code || cartAmount === undefined) {
    return res.status(400).json({ success: false, message: 'Coupon code and cart amount required.' });
  }

  try {
    const coupons = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code]);
    
    if (coupons.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    const coupon = coupons[0];
    const expiry = new Date(coupon.active_until);
    if (expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    if (parseFloat(cartAmount) < parseFloat(coupon.min_order_value)) {
      return res.status(400).json({ 
        success: false, 
        message: `Min order value to apply this coupon is ₹${coupon.min_order_value}.` 
      });
    }

    let discount = 0.00;
    if (coupon.discount_type === 'flat') {
      discount = parseFloat(coupon.discount_value);
    } else {
      discount = (parseFloat(cartAmount) * parseFloat(coupon.discount_value)) / 100;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      couponCode: coupon.code,
      discountAmount: discount.toFixed(2)
    });
  } catch (error) {
    next(error);
  }
}

// --- Order & Checkout Checkout Placement ---

async function checkoutOrder(req, res, next) {
  const userId = req.user.id;
  const { addressId, couponCode } = req.body;

  if (!addressId) {
    return res.status(400).json({ success: false, message: 'Shipping address selection is required.' });
  }

  try {
    // 1. Fetch address
    const addresses = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (addresses.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipping address not found.' });
    }

    // 2. Fetch cart items
    const cartItems = await db.query(`
      SELECT c.product_id, c.quantity, p.name, p.price, p.discount_price, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 3. Verify stock
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${item.name}. Only ${item.stock_quantity} left.` 
        });
      }
    }

    // 4. Calculate total cart amount
    let totalAmount = 0.00;
    cartItems.forEach(item => {
      const finalPrice = item.discount_price || item.price;
      totalAmount += finalPrice * item.quantity;
    });

    // 5. Apply coupon if applicable
    let discountAmount = 0.00;
    if (couponCode) {
      const couponCheck = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [couponCode]);
      if (couponCheck.length > 0) {
        const coupon = couponCheck[0];
        const expiry = new Date(coupon.active_until);
        if (expiry >= new Date() && totalAmount >= parseFloat(coupon.min_order_value)) {
          if (coupon.discount_type === 'flat') {
            discountAmount = parseFloat(coupon.discount_value);
          } else {
            discountAmount = (totalAmount * parseFloat(coupon.discount_value)) / 100;
          }
        }
      }
    }

    const payableAmount = Math.max(0.00, totalAmount - discountAmount);
    const orderNumber = `CIRCUIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 6. Insert Order as Pending
    const orderResult = await db.query(`
      INSERT INTO orders (user_id, order_number, total_amount, discount_amount, coupon_code, payment_status, shipping_status, address_id)
      VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?)
    `, [userId, orderNumber, payableAmount, discountAmount, couponCode || null, addressId]);

    const orderId = orderResult.insertId;

    // 7. Insert Order Items
    for (const item of cartItems) {
      const finalPrice = item.discount_price || item.price;
      await db.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, finalPrice]);
    }

    // 8. Generate payment gateway order (Razorpay or Mock)
    let pgOrderId = `order_mock_${Date.now()}`;
    if (isRazorpayConfigured && razorpayInstance) {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(payableAmount * 100), // in paisa
          currency: 'INR',
          receipt: orderNumber,
          payment_capture: 1
        });
        pgOrderId = razorpayOrder.id;
      } catch (err) {
        console.error('Razorpay Order API Failed:', err);
        // Clean order entries on gateway failure to avoid dangling pending records
        await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await db.query('DELETE FROM orders WHERE id = ?', [orderId]);
        return res.status(500).json({ success: false, message: 'Gateway error. Payment creation failed.' });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order draft created.',
      orderId,
      orderNumber,
      payableAmount,
      pgOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_keys_circuitops'
    });

  } catch (error) {
    next(error);
  }
}

// --- Payment Verification & Stock Capture ---

async function verifyPayment(req, res, next) {
  const userId = req.user.id;
  const { 
    orderId, 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature, 
    isSimulated // Flag for offline mock sandbox trigger
  } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpayOrderId) {
    return res.status(400).json({ success: false, message: 'Payment token parameters missing.' });
  }

  try {
    // 1. Find Order
    const orders = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order reference not found.' });
    }

    const order = orders[0];

    // 2. Signature Validation
    let signatureVerified = false;

    if (isRazorpayConfigured && razorpayInstance && !isSimulated) {
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
      
      signatureVerified = expectedSignature === razorpaySignature;
    } else {
      // Mock Sandbox Verification always passes
      signatureVerified = true;
      console.log(`💳 Payments Simulator: Verified simulated payment ${razorpayPaymentId}`);
    }

    if (!signatureVerified) {
      await db.query("UPDATE orders SET payment_status = 'failed' WHERE id = ?", [orderId]);
      return res.status(400).json({ success: false, message: 'Payment verification signature invalid.' });
    }

    // 3. Mark payment successful & order paid
    await db.query("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [orderId]);

    // Save payment metadata
    await db.query(`
      INSERT INTO payments (order_id, transaction_id, gateway, payment_method, amount, status, payload)
      VALUES (?, ?, 'razorpay', 'online', ?, 'successful', ?)
    `, [orderId, razorpayPaymentId, order.total_amount, JSON.stringify(req.body)]);

    // 4. Update Stock Quantities (Decrement)
    const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      await db.query('UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?', [item.quantity, item.product_id]);
    }

    // 5. Clear Cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed!',
      orderNumber: order.order_number
    });

  } catch (error) {
    next(error);
  }
}

// --- Customer Order Dashboard Views ---

async function getOrders(req, res, next) {
  const userId = req.user.id;
  try {
    const orders = await db.query(`
      SELECT o.*, a.street, a.city, a.pin_code,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderDetails(req, res, next) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const orders = await db.query(`
      SELECT o.*, a.name as recipient_name, a.phone, a.street, a.city, a.state, a.pin_code
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const orderItems = await db.query(`
      SELECT oi.id, oi.quantity, oi.price, p.name, p.slug, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.status(200).json({
      success: true,
      order: orders[0],
      items: orderItems
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  validateCoupon,
  checkoutOrder,
  verifyPayment,
  getOrders,
  getOrderDetails
};
