const { supabase } = require('../config/supabase');

// Get all messages for a conversation
exports.getAllMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ messages: messages || [] });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Get single message
exports.getMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
};

// Create new message
exports.createMessage = async (req, res) => {
  try {
    const { conversation_id, message_id, sender_id, sender_name, text, attachments, is_from_page, timestamp } = req.body;

    // Check if message already exists
    if (message_id) {
      const { data: existing } = await supabase
        .from('messages')
        .select('*')
        .eq('message_id', message_id)
        .single();

      if (existing) {
        return res.json({ message: 'Message already exists', message: existing });
      }
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id,
          message_id,
          sender_id,
          sender_name,
          text,
          attachments: attachments || null,
          is_from_page: is_from_page || false,
          timestamp: timestamp || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message: text,
        last_message_time: timestamp || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id);

    res.status(201).json({ message: 'Message created successfully', message });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
};

// Send message to Facebook
exports.sendMessage = async (req, res) => {
  try {
    const { conversation_id, recipient_id, text, page_access_token } = req.body;

    // Send message via Facebook API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${page_access_token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipient_id },
          message: { text }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Save message to database
    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id,
          message_id: data.message_id,
          sender_id: 'page',
          sender_name: 'Page',
          text,
          is_from_page: true,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message: text,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id);

    res.json({ message: 'Message sent successfully', message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

// Sync messages for a conversation
exports.syncMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Get conversation details
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*, pages!inner(*)')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Fetch messages from Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${conversation.sender_id}/messages?fields=id,message,from,created_time,attachments&limit=100&access_token=${conversation.pages.page_access_token}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const messages = data.data || [];
    const synced = [];

    for (const msg of messages) {
      const { data: message, error } = await supabase
        .from('messages')
        .upsert({
          conversation_id: conversationId,
          message_id: msg.id,
          sender_id: msg.from.id,
          sender_name: msg.from.name || 'Unknown',
          text: msg.message || '',
          attachments: msg.attachments || null,
          is_from_page: msg.from.id === conversation.pages.page_id,
          timestamp: msg.created_time
        }, {
          onConflict: 'message_id'
        })
        .select()
        .single();

      if (!error && message) {
        synced.push(message);
      }
    }

    res.json({ 
      message: `Synced ${synced.length} messages`, 
      messages: synced 
    });
  } catch (error) {
    console.error('Sync messages error:', error);
    res.status(500).json({ message: 'Error syncing messages', error: error.message });
  }
};