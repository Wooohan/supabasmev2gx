const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all agents
router.get('/', agentController.getAllAgents);

// Get single agent
router.get('/:id', agentController.getAgent);

// Create new agent
router.post('/', agentController.createAgent);

// Update agent
router.put('/:id', agentController.updateAgent);

// Delete agent
router.delete('/:id', agentController.deleteAgent);

module.exports = router;