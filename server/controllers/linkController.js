const { supabase } = require('../config/supabase');

// Get all approved links for current user
exports.getAllLinks = async (req, res) => {
  try {
    const { data: links, error } = await supabase
      .from('approved_links')
      .select('*')
      .eq('user_id', req.session.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ links: links || [] });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ message: 'Error fetching links', error: error.message });
  }
};

// Get single link
exports.getLink = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: link, error } = await supabase
      .from('approved_links')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .single();

    if (error) throw error;

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ link });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ message: 'Error fetching link', error: error.message });
  }
};

// Create new link
exports.createLink = async (req, res) => {
  try {
    const { url, title, description } = req.body;

    const { data: link, error } = await supabase
      .from('approved_links')
      .insert([
        {
          user_id: req.session.userId,
          url,
          title,
          description
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Link added successfully', link });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ message: 'Error adding link', error: error.message });
  }
};

// Update link
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: link, error } = await supabase
      .from('approved_links')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .select()
      .single();

    if (error) throw error;

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link updated successfully', link });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ message: 'Error updating link', error: error.message });
  }
};

// Delete link
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('approved_links')
      .delete()
      .eq('id', id)
      .eq('user_id', req.session.userId);

    if (error) throw error;

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ message: 'Error deleting link', error: error.message });
  }
};