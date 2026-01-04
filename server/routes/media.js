const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all media
router.get('/', mediaController.getAllMedia);

// Get single media
router.get('/:id', mediaController.getMedia);

// Upload media
router.post('/', mediaController.uploadMedia);

// Delete media
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;