const { supabase } = require('../config/supabase');

// Get all conversations for a page
exports.getAllConversations = async (req, res) => {
  try {
    const { pageId } = req.params;

    // Verify page belongs to user
    const { data: page } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('user_id', req.session.userId)
      .single();

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('page_id', pageId)
      .order('last_message_time', { ascending: false });

    if (error) throw error;

    res.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Get single conversation
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*, pages!inner(user_id)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!conversation || conversation.pages.user_id !== req.session.userId) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

// Create or update conversation
exports.createOrUpdateConversation = async (req, res) => {
  try {
    const { page_id, sender_id, sender_name, last_message, last_message_time } = req.body;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('page_id', page_id)
      .eq('sender_id', sender_id)
      .single();

    if (existing) {
      // Update existing conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .update({
          last_message,
          last_message_time,
          unread_count: existing.unread_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: 'Conversation updated', conversation });
    } else {
      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([
          {
            page_id,
            sender_id,
            sender_name,
            last_message,
            last_message_time,
            unread_count: 1,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'Conversation created', conversation });
    }
  } catch (error) {
    console.error('Create/Update conversation error:', error);
    res.status(500).json({ message: 'Error managing conversation', error: error.message });
  }
};

// Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({
        unread_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Conversation marked as read', conversation });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking conversation as read', error: error.message });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
};

// Sync conversations from Facebook (last 5)
exports.syncRecentConversations = async (req, res) => {
  try {
    const { pageId } = req.params;

    // Verify page belongs to user
    const { data: page } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('user_id', req.session.userId)
      .single();

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Fetch last 5 conversations from Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${page.page_id}/conversations?fields=participants,updated_time,messages.limit(1){message,from,created_time}&limit=5&access_token=${page.page_access_token}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const conversations = data.data || [];
    const synced = [];

    for (const conv of conversations) {
      const participant = conv.participants?.data?.find(p => p.id !== page.page_id);
      const lastMsg = conv.messages?.data?.[0];

      if (participant && lastMsg) {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .upsert({
            page_id: pageId,
            sender_id: participant.id,
            sender_name: participant.name || 'Unknown',
            last_message: lastMsg.message || '',
            last_message_time: lastMsg.created_time,
            status: 'active'
          }, {
            onConflict: 'page_id,sender_id'
          })
          .select()
          .single();

        if (!error && conversation) {
          synced.push(conversation);
        }
      }
    }

    res.json({ 
      message: `Synced ${synced.length} recent conversations`, 
      conversations: synced 
    });
  } catch (error) {
    console.error('Sync recent conversations error:', error);
    res.status(500).json({ message: 'Error syncing conversations', error: error.message });
  }
};

// Sync all conversations from Facebook
exports.syncAllConversations = async (req, res) => {
  try {
    const { pageId } = req.params;

    // Verify page belongs to user
    const { data: page } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('user_id', req.session.userId)
      .single();

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    let allConversations = [];
    let nextUrl = `https://graph.facebook.com/v18.0/${page.page_id}/conversations?fields=participants,updated_time,messages.limit(1){message,from,created_time}&limit=100&access_token=${page.page_access_token}`;

    // Fetch all conversations with pagination
    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      allConversations = allConversations.concat(data.data || []);
      nextUrl = data.paging?.next || null;

      // Limit to prevent excessive API calls (max 500 conversations)
      if (allConversations.length >= 500) break;
    }

    const synced = [];

    for (const conv of allConversations) {
      const participant = conv.participants?.data?.find(p => p.id !== page.page_id);
      const lastMsg = conv.messages?.data?.[0];

      if (participant && lastMsg) {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .upsert({
            page_id: pageId,
            sender_id: participant.id,
            sender_name: participant.name || 'Unknown',
            last_message: lastMsg.message || '',
            last_message_time: lastMsg.created_time,
            status: 'active'
          }, {
            onConflict: 'page_id,sender_id'
          })
          .select()
          .single();

        if (!error && conversation) {
          synced.push(conversation);
        }
      }
    }

    res.json({ 
      message: `Synced ${synced.length} total conversations`, 
      conversations: synced 
    });
  } catch (error) {
    console.error('Sync all conversations error:', error);
    res.status(500).json({ message: 'Error syncing all conversations', error: error.message });
  }
};