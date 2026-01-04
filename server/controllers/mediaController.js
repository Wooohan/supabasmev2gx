const { supabase } = require('../config/supabase');

// Get all media for current user
exports.getAllMedia = async (req, res) => {
  try {
    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('user_id', req.session.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ media: media || [] });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ message: 'Error fetching media', error: error.message });
  }
};

// Get single media
exports.getMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.session.userId)
      .single();

    if (error) throw error;

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    res.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ message: 'Error fetching media', error: error.message });
  }
};

// Upload media
exports.uploadMedia = async (req, res) => {
  try {
    const { filename, url, type, size } = req.body;

    const { data: media, error } = await supabase
      .from('media')
      .insert([
        {
          user_id: req.session.userId,
          filename,
          url,
          type,
          size
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Media uploaded successfully', media });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ message: 'Error uploading media', error: error.message });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id)
      .eq('user_id', req.session.userId);

    if (error) throw error;

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ message: 'Error deleting media', error: error.message });
  }
};