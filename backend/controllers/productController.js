const db = require('../config/db');

// Helper to generate unique slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')         // replace spaces with hyphens
    .replace(/-+/g, '-');         // remove duplicate hyphens
}

// Get All Products (with filters, search, sort, pagination)
async function getAllProducts(req, res, next) {
  try {
    let { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      rating, 
      sort, 
      page, 
      limit 
    } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;
    const offset = (page - 1) * limit;

    let queryStr = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.status = 'active'
    `;
    const queryParams = [];

    // Filters
    if (category) {
      queryStr += ` AND (c.slug = ? OR c.id = ?)`;
      queryParams.push(category, category);
    }

    if (minPrice) {
      queryStr += ` AND COALESCE(p.discount_price, p.price) >= ?`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      queryStr += ` AND COALESCE(p.discount_price, p.price) <= ?`;
      queryParams.push(parseFloat(maxPrice));
    }

    // Search query using fulltext or simple LIKE
    if (search) {
      queryStr += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    queryStr += ` GROUP BY p.id`;

    // Having rating filter
    if (rating) {
      queryStr += ` HAVING avg_rating >= ?`;
      queryParams.push(parseFloat(rating));
    }

    // Sorting
    let orderBy = 'p.created_at DESC'; // default newest
    if (sort) {
      switch (sort) {
        case 'price-asc':
          orderBy = 'COALESCE(p.discount_price, p.price) ASC';
          break;
        case 'price-desc':
          orderBy = 'COALESCE(p.discount_price, p.price) DESC';
          break;
        case 'rating':
          orderBy = 'avg_rating DESC';
          break;
        case 'popular':
          orderBy = 'review_count DESC';
          break;
      }
    }
    queryStr += ` ORDER BY ${orderBy}`;

    // Get count before limit (simplifying total records search)
    const allMatching = await db.query(queryStr, queryParams);
    const totalCount = allMatching.length;

    // Apply pagination
    queryStr += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const products = await db.query(queryStr, queryParams);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalProducts: totalCount,
      products
    });
  } catch (error) {
    next(error);
  }
}

// Get Product by Slug (with reviews & related products)
async function getProductBySlug(req, res, next) {
  const { slug } = req.params;

  try {
    // 1. Fetch Product details
    const products = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'active'
    `, [slug]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];

    // 2. Fetch inventory locations
    const inventory = await db.query('SELECT * FROM inventory WHERE product_id = ?', [product.id]);
    product.inventory = inventory[0] || null;

    // 3. Fetch reviews joined with User Name
    const reviews = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [product.id]);

    product.reviews = reviews;

    // Calculate Average Rating
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.avg_rating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    product.review_count = reviews.length;

    // 4. Fetch related products (same category, excluding current product)
    const related = await db.query(`
      SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.image_url,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      GROUP BY p.id
      LIMIT 4
    `, [product.category_id, product.id]);

    res.status(200).json({
      success: true,
      product,
      related
    });
  } catch (error) {
    next(error);
  }
}

// Get All Categories
async function getCategories(req, res, next) {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
}

// Admin: Create Product
async function createProduct(req, res, next) {
  const { name, description, price, discount_price, category_id, stock_quantity, image_url, bin_location, safety_stock } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ success: false, message: 'Please provide product name, price, and category.' });
  }

  const slug = generateSlug(name);

  try {
    // Check if slug exists
    const existing = await db.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A product with this name (or slug) already exists.' });
    }

    // Insert Product
    const result = await db.query(`
      INSERT INTO products (name, slug, description, price, discount_price, category_id, stock_quantity, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [name, slug, description || '', price, discount_price || null, category_id, stock_quantity || 0, image_url || null]);

    const productId = result.insertId;

    // Create Inventory entry
    await db.query(`
      INSERT INTO inventory (product_id, bin_location, safety_stock, last_restocked)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [productId, bin_location || 'A-00', safety_stock || 5]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      productId,
      slug
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Update Product
async function updateProduct(req, res, next) {
  const { id } = req.params;
  const { name, description, price, discount_price, category_id, stock_quantity, image_url, status, bin_location, safety_stock } = req.body;

  try {
    // Check if product exists
    const products = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const currentProduct = products[0];
    const newSlug = name ? generateSlug(name) : currentProduct.slug;

    // Update Product fields
    await db.query(`
      UPDATE products 
      SET name = COALESCE(?, name),
          slug = ?,
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          discount_price = ?,
          category_id = COALESCE(?, category_id),
          stock_quantity = COALESCE(?, stock_quantity),
          image_url = COALESCE(?, image_url),
          status = COALESCE(?, status)
      WHERE id = ?
    `, [name, newSlug, description, price, discount_price, category_id, stock_quantity, image_url, status, id]);

    // Update Inventory
    if (bin_location || safety_stock !== undefined) {
      await db.query(`
        UPDATE inventory
        SET bin_location = COALESCE(?, bin_location),
            safety_stock = COALESCE(?, safety_stock),
            last_restocked = CASE WHEN ? > 0 THEN CURRENT_TIMESTAMP ELSE last_restocked END
        WHERE product_id = ?
      `, [bin_location, safety_stock, stock_quantity > currentProduct.stock_quantity ? 1 : 0, id]);
    }

    res.status(200).json({ success: true, message: 'Product updated successfully!' });
  } catch (error) {
    next(error);
  }
}

// Admin: Delete Product (Soft delete by marking status as inactive or hard delete if no orders)
async function deleteProduct(req, res, next) {
  const { id } = req.params;

  try {
    // Check if product is in any orders
    const orderItems = await db.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    
    if (orderItems.length > 0) {
      // Soft delete: Mark as inactive
      await db.query("UPDATE products SET status = 'inactive', stock_quantity = 0 WHERE id = ?", [id]);
      return res.status(200).json({ 
        success: true, 
        message: 'Product is linked to existing orders. Status has been changed to inactive.' 
      });
    }

    // Hard delete: Clean inventory first
    await db.query('DELETE FROM inventory WHERE product_id = ?', [id]);
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// Add Product Review
async function addReview(req, res, next) {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!productId || !rating) {
    return res.status(400).json({ success: false, message: 'Product ID and rating are required.' });
  }

  try {
    // Verify if user bought this product before reviewing
    const orderCheck = await db.query(`
      SELECT oi.id 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'paid'
      LIMIT 1
    `, [userId, productId]);

    if (orderCheck.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Review forbidden. You can only review products you have successfully purchased.' 
      });
    }

    // Check if review already exists
    const reviewCheck = await db.query('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (reviewCheck.length > 0) {
      await db.query('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?', [rating, comment || '', reviewCheck[0].id]);
      return res.status(200).json({ success: true, message: 'Review updated successfully!' });
    }

    // Insert new review
    await db.query('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)', [userId, productId, rating, comment || '']);
    res.status(201).json({ success: true, message: 'Review added successfully!' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
};
