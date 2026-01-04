const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all conversations for a page
router.get('/page/:pageId', conversationController.getAllConversations);

// Get single conversation
router.get('/:id', conversationController.getConversation);

// Create or update conversation
router.post('/', conversationController.createOrUpdateConversation);

// Mark conversation as read
router.patch('/:id/read', conversationController.markAsRead);

// Delete conversation
router.delete('/:id', conversationController.deleteConversation);

// Sync recent conversations (last 5)
router.post('/page/:pageId/sync-recent', conversationController.syncRecentConversations);

// Sync all conversations
router.post('/page/:pageId/sync-all', conversationController.syncAllConversations);

module.exports = router;