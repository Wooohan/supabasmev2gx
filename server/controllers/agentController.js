const { supabase } = require('../config/supabase');

// Get all agents for current user
exports.getAllAgents = async (req, res) => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', req.session.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ agents: agents || [] });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
};

// Get single agent
exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .single();

    if (error) throw error;

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ agent });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
};

// Create new agent
exports.createAgent = async (req, res) => {
  try {
    const { name, description, personality, response_style, knowledge_base } = req.body;

    const { data: agent, error } = await supabase
      .from('agents')
      .insert([
        {
          user_id: req.session.userId,
          name,
          description,
          personality,
          response_style,
          knowledge_base,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Agent created successfully', agent });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Error creating agent', error: error.message });
  }
};

// Update agent
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .select()
      .single();

    if (error) throw error;

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent updated successfully', agent });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Error updating agent', error: error.message });
  }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', req.session.userId);

    if (error) throw error;

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Error deleting agent', error: error.message });
  }
};