const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all links
router.get('/', linkController.getAllLinks);

// Get single link
router.get('/:id', linkController.getLink);

// Create new link
router.post('/', linkController.createLink);

// Update link
router.put('/:id', linkController.updateLink);

// Delete link
router.delete('/:id', linkController.deleteLink);

module.exports = router;