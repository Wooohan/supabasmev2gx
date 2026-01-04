const { supabase } = require('../config/supabase');

// Get all pages for current user
exports.getAllPages = async (req, res) => {
  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', req.session.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ pages: pages || [] });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
};

// Get single page
exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .single();

    if (error) throw error;

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
};

// Create new page
exports.createPage = async (req, res) => {
  try {
    const { page_id, page_name, page_access_token, agent_id } = req.body;

    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('*')
      .eq('page_id', page_id)
      .single();

    if (existingPage) {
      return res.status(400).json({ message: 'Page already connected' });
    }

    const { data: page, error } = await supabase
      .from('pages')
      .insert([
        {
          user_id: req.session.userId,
          page_id,
          page_name,
          page_access_token,
          agent_id: agent_id || null,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Page connected successfully', page });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ message: 'Error connecting page', error: error.message });
  }
};

// Update page
exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: page, error } = await supabase
      .from('pages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .select()
      .single();

    if (error) throw error;

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Page updated successfully', page });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
};

// Delete page
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
      .eq('user_id', req.session.userId);

    if (error) throw error;

    res.json({ message: 'Page disconnected successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Error disconnecting page', error: error.message });
  }
};

// Assign agent to page
exports.assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;

    const { data: page, error } = await supabase
      .from('pages')
      .update({
        agent_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .select()
      .single();

    if (error) throw error;

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Agent assigned successfully', page });
  } catch (error) {
    console.error('Assign agent error:', error);
    res.status(500).json({ message: 'Error assigning agent', error: error.message });
  }
};