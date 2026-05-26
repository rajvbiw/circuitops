const db = require('../config/db');
const aiProvider = require('../services/aiProvider');

// Main chat completion handler
async function handleChat(req, res, next) {
  const { message } = req.body;
  const userId = req.user ? req.user.id : null; // Support guest users or logged-in users

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message prompt is required.' });
  }

  try {
    const lowerMessage = message.toLowerCase();
    let productsContext = [];

    // 1. Context Selection: Find relevant products from DB using basic semantic category keywords
    let categoryKeyword = null;

    if (lowerMessage.includes('phone') || lowerMessage.includes('mobile') || lowerMessage.includes('smartphone') || lowerMessage.includes('5g')) {
      categoryKeyword = 'smartphones';
    } else if (lowerMessage.includes('laptop') || lowerMessage.includes('notebook') || lowerMessage.includes('computer') || lowerMessage.includes('bhide')) {
      categoryKeyword = 'laptops';
    } else if (lowerMessage.includes('tv') || lowerMessage.includes('television') || lowerMessage.includes('screen') || lowerMessage.includes('cinema') || lowerMessage.includes('audio') || lowerMessage.includes('speaker')) {
      categoryKeyword = 'smart-tvs';
    } else if (lowerMessage.includes('ac') || lowerMessage.includes('conditioner') || lowerMessage.includes('cooling') || lowerMessage.includes('washing') || lowerMessage.includes('machine') || lowerMessage.includes('mixer') || lowerMessage.includes('grinder') || lowerMessage.includes('appliance')) {
      categoryKeyword = 'home-appliances';
    } else if (lowerMessage.includes('game') || lowerMessage.includes('console') || lowerMessage.includes('playbox') || lowerMessage.includes('controller') || lowerMessage.includes('neon')) {
      categoryKeyword = 'gaming';
    } else if (lowerMessage.includes('powerbank') || lowerMessage.includes('charger') || lowerMessage.includes('neckband') || lowerMessage.includes('accessory') || lowerMessage.includes('earphone')) {
      categoryKeyword = 'accessories';
    }

    if (categoryKeyword) {
      // Fetch products in specific matching category
      productsContext = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = ? AND p.status = 'active'
      `, [categoryKeyword]);
    } else {
      // General or cross-category query (e.g., comparing products, asking for all products, deals)
      // Fetch up to 15 active products to supply to AI context
      productsContext = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        LIMIT 15
      `);
    }

    // 2. Fetch User Chat History (limit to last 10 messages)
    let chatHistory = [];
    if (userId) {
      chatHistory = await db.query(`
        SELECT sender, message 
        FROM ai_chat_history 
        WHERE user_id = ? 
        ORDER BY created_at ASC 
        LIMIT 10
      `, [userId]);
    }

    // 3. Delegate to AI Provider Abstraction
    const responseText = await aiProvider.generateChatResponse(
      message,
      productsContext,
      chatHistory
    );

    // 4. Save exchange to DB Chat History
    if (userId) {
      const contextProductIds = productsContext.map(p => p.id).join(',');
      
      // Save User Message
      await db.query(
        'INSERT INTO ai_chat_history (user_id, message, sender, context_products) VALUES (?, ?, ?, ?)',
        [userId, message, 'user', contextProductIds]
      );
      // Save AI Message
      await db.query(
        'INSERT INTO ai_chat_history (user_id, message, sender, context_products) VALUES (?, ?, ?, ?)',
        [userId, responseText, 'ai', contextProductIds]
      );
    }

    res.status(200).json({
      success: true,
      response: responseText,
      productsUsed: productsContext.map(p => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, discount_price: p.discount_price }))
    });

  } catch (error) {
    next(error);
  }
}

// Clear AI Chat History for a User
async function clearHistory(req, res, next) {
  const userId = req.user.id;
  try {
    await db.query('DELETE FROM ai_chat_history WHERE user_id = ?', [userId]);
    res.status(200).json({ success: true, message: 'AI Assistant conversation history cleared.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleChat,
  clearHistory
};
