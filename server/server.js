const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const { supabase, initializeDatabase } = require('./config/supabase');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://your-domain.vercel.app']
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/links', require('./routes/links'));
app.use('/api/media', require('./routes/media'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MessengerFlow API is running',
    database: 'Supabase',
    timestamp: new Date().toISOString()
  });
});

// Real-time webhook endpoint for Facebook Messenger
app.post('/api/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Verify webhook
    if (body.object === 'page') {
      // Process each entry
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];
        
        if (webhookEvent && webhookEvent.message) {
          const senderId = webhookEvent.sender.id;
          const pageId = webhookEvent.recipient.id;
          const messageText = webhookEvent.message.text;
          const messageId = webhookEvent.message.mid;
          const timestamp = new Date(webhookEvent.timestamp).toISOString();

          // Find the page in database
          const { data: page } = await supabase
            .from('pages')
            .select('*')
            .eq('page_id', pageId)
            .single();

          if (page) {
            // Find or create conversation
            let { data: conversation } = await supabase
              .from('conversations')
              .select('*')
              .eq('page_id', page.id)
              .eq('sender_id', senderId)
              .single();

            if (!conversation) {
              // Get sender info from Facebook
              const senderResponse = await fetch(
                `https://graph.facebook.com/v18.0/${senderId}?fields=name&access_token=${page.page_access_token}`
              );
              const senderData = await senderResponse.json();

              const { data: newConv } = await supabase
                .from('conversations')
                .insert([{
                  page_id: page.id,
                  sender_id: senderId,
                  sender_name: senderData.name || 'Unknown',
                  last_message: messageText,
                  last_message_time: timestamp,
                  unread_count: 1,
                  status: 'active'
                }])
                .select()
                .single();

              conversation = newConv;
            } else {
              // Update conversation
              await supabase
                .from('conversations')
                .update({
                  last_message: messageText,
                  last_message_time: timestamp,
                  unread_count: conversation.unread_count + 1,
                  updated_at: new Date().toISOString()
                })
                .eq('id', conversation.id);
            }

            // Save message
            await supabase
              .from('messages')
              .insert([{
                conversation_id: conversation.id,
                message_id: messageId,
                sender_id: senderId,
                sender_name: conversation.sender_name,
                text: messageText,
                is_from_page: false,
                timestamp: timestamp
              }]);

            // TODO: Process with AI agent if assigned
            if (page.agent_id) {
              // Get agent details and generate response
              // This would integrate with your AI service
            }
          }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Webhook verification endpoint
app.get('/api/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your_webhook_verify_token';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Supabase`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;