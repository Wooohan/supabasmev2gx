const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all messages for a conversation
router.get('/conversation/:conversationId', messageController.getAllMessages);

// Get single message
router.get('/:id', messageController.getMessage);

// Create new message
router.post('/', messageController.createMessage);

// Send message to Facebook
router.post('/send', messageController.sendMessage);

// Delete message
router.delete('/:id', messageController.deleteMessage);

// Sync messages for a conversation
router.post('/conversation/:conversationId/sync', messageController.syncMessages);

module.exports = router;