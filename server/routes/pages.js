const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all pages
router.get('/', pageController.getAllPages);

// Get single page
router.get('/:id', pageController.getPage);

// Create new page
router.post('/', pageController.createPage);

// Update page
router.put('/:id', pageController.updatePage);

// Delete page
router.delete('/:id', pageController.deletePage);

// Assign agent to page
router.post('/:id/assign-agent', pageController.assignAgent);

module.exports = router;