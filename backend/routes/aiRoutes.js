const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateJWT } = require('../middlewares/auth');

// Require authentication for AI assistant usage to ground chat history log tracking
router.use(authenticateJWT);

router.post('/chat', aiController.handleChat);
router.delete('/chat/history', aiController.clearHistory);

module.exports = router;
