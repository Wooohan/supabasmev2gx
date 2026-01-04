# Supabase Setup Guide for MessengerFlow

## Overview
MessengerFlow has been successfully migrated from MongoDB to Supabase with real-time messaging capabilities.

## Database Configuration

### 1. Supabase Project Details
- **Project URL**: `https://fiuodbhgvmylvbanbfve.supabase.co`
- **Project Ref**: `fiuodbhgvmylvbanbfve`

### 2. Initialize Database Schema

You need to run the SQL schema in your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `fiuodbhgvmylvbanbfve`
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of `server/config/supabase-init.sql`
5. Paste and run the SQL script

This will create all necessary tables:
- `users` - User accounts
- `agents` - AI agents
- `pages` - Facebook pages
- `conversations` - Chat conversations
- `messages` - Individual messages
- `approved_links` - Approved links for sharing
- `media` - Media files

### 3. Get Your Anon Key

After creating the tables, you need to get your Supabase Anon Key:

1. In Supabase Dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left menu
3. Copy the `anon` `public` key
4. Update the `.env` file in the root directory:

```env
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 4. Enable Realtime

For real-time messaging to work:

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable replication for these tables:
   - `messages`
   - `conversations`

## Environment Variables

### Backend (.env in /server directory)
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://fiuodbhgvmylvbanbfve.supabase.co
SUPABASE_KEY=sb_secret_x33xGa8YmioWvfyvDtWNXA_fT_8VL9V

# Facebook App Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### Frontend (.env in root directory)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://fiuodbhgvmylvbanbfve.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Features Implemented

### ✅ Database Migration
- All MongoDB models converted to Supabase tables
- Proper relationships and foreign keys
- Indexes for optimal query performance
- Row Level Security (RLS) policies

### ✅ Real-time Messaging
- Real-time message updates using Supabase Realtime
- Live conversation updates
- Instant notification of new messages
- Subscribe/unsubscribe functionality

### ✅ Smart Sync
- **Sync Recent**: Fetches last 5 conversations from Facebook
- **Sync All**: Fetches all conversations (up to 500)
- Message syncing for individual conversations
- Automatic deduplication using unique message IDs

### ✅ API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get single agent
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### Pages
- `GET /api/pages` - Get all pages
- `GET /api/pages/:id` - Get single page
- `POST /api/pages` - Connect page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Disconnect page
- `POST /api/pages/:id/assign-agent` - Assign agent to page

#### Conversations
- `GET /api/conversations/page/:pageId` - Get all conversations for a page
- `GET /api/conversations/:id` - Get single conversation
- `POST /api/conversations` - Create/update conversation
- `PATCH /api/conversations/:id/read` - Mark as read
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/page/:pageId/sync-recent` - Sync last 5 conversations
- `POST /api/conversations/page/:pageId/sync-all` - Sync all conversations

#### Messages
- `GET /api/messages/conversation/:conversationId` - Get messages (with pagination)
- `GET /api/messages/:id` - Get single message
- `POST /api/messages` - Create message
- `POST /api/messages/send` - Send message to Facebook
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/conversation/:conversationId/sync` - Sync messages

#### Links
- `GET /api/links` - Get all approved links
- `POST /api/links` - Add new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

#### Media
- `GET /api/media` - Get all media
- `POST /api/media` - Upload media
- `DELETE /api/media/:id` - Delete media

### ✅ Real-time Service (Frontend)

The `realtimeService.ts` provides:

```typescript
// Subscribe to messages for a conversation
realtimeService.subscribeToMessages(
  conversationId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete
);

// Subscribe to conversations for a page
realtimeService.subscribeToConversations(
  pageId,
  onNewConversation,
  onConversationUpdate,
  onConversationDelete
);

// Unsubscribe when component unmounts
realtimeService.unsubscribeAll();
```

## Running the Application

### 1. Start Backend Server
```bash
cd server
npm install
node server.js
```

Server will run on: http://localhost:5000

### 2. Start Frontend
```bash
cd ..
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

## Testing the Setup

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MessengerFlow API is running",
  "database": "Supabase",
  "timestamp": "2026-01-04T20:07:14.710Z"
}
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 3. Verify Database
Go to Supabase Dashboard → Table Editor and check that tables are created and data is being stored.

## Facebook Webhook Setup

### 1. Configure Webhook URL
In Facebook Developer Console, set webhook URL to:
```
https://your-domain.com/api/webhook
```

### 2. Verify Token
Use the `FACEBOOK_VERIFY_TOKEN` from your `.env` file

### 3. Subscribe to Events
Subscribe to these webhook events:
- `messages`
- `messaging_postbacks`
- `message_deliveries`
- `message_reads`

## Deployment Considerations

### Production Environment Variables
Update these for production:
- `SESSION_SECRET` - Use a strong random string
- `NODE_ENV=production`
- Update CORS origins in `server.js`
- Use HTTPS for webhook URL

### Supabase Production
- Enable RLS policies properly
- Set up proper authentication
- Configure storage buckets if needed
- Monitor usage and performance

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check if tables are created in Supabase Dashboard
- Ensure RLS policies allow your operations

### Real-time Not Working
- Enable replication for `messages` and `conversations` tables
- Check browser console for WebSocket connection errors
- Verify Supabase Anon Key is correct

### Webhook Not Receiving Messages
- Verify webhook URL is accessible from internet
- Check Facebook App webhook subscription
- Ensure verify token matches
- Check server logs for errors

## Next Steps

1. **Run the SQL schema** in Supabase Dashboard
2. **Get and update the Anon Key** in `.env`
3. **Enable Realtime** for messages and conversations tables
4. **Configure Facebook App** with webhook URL
5. **Test the application** with real Facebook messages

## Support

For issues or questions:
- Check server logs: `server/server.log`
- Review Supabase logs in Dashboard
- Test API endpoints with curl or Postman
- Verify environment variables are set correctly