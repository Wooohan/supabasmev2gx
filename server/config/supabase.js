const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://fiuodbhgvmylvbanbfve.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_secret_x33xGa8YmioWvfyvDtWNXA_fT_8VL9V';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    // Create tables using SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Agents table
        CREATE TABLE IF NOT EXISTS agents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          personality TEXT,
          response_style TEXT,
          knowledge_base TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Pages table
        CREATE TABLE IF NOT EXISTS pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          page_id TEXT UNIQUE NOT NULL,
          page_name TEXT NOT NULL,
          page_access_token TEXT NOT NULL,
          agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Conversations table
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
          sender_id TEXT NOT NULL,
          sender_name TEXT,
          last_message TEXT,
          last_message_time TIMESTAMPTZ,
          unread_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Messages table
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
          message_id TEXT UNIQUE,
          sender_id TEXT NOT NULL,
          sender_name TEXT,
          text TEXT,
          attachments JSONB,
          is_from_page BOOLEAN DEFAULT false,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Links table
        CREATE TABLE IF NOT EXISTS approved_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          title TEXT,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Media table
        CREATE TABLE IF NOT EXISTS media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          filename TEXT NOT NULL,
          url TEXT NOT NULL,
          type TEXT NOT NULL,
          size INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
        CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_page_id ON conversations(page_id);
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_links_user_id ON approved_links(user_id);
        CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
      `
    });

    if (error) {
      console.log('Tables may already exist or using alternative initialization');
    } else {
      console.log('✅ Supabase database initialized successfully');
    }
  } catch (error) {
    console.log('Database initialization note:', error.message);
  }
}

module.exports = { supabase, initializeDatabase };