# MessengerFlow - AI-Powered Facebook Messenger Management

A full-stack application for managing Facebook Messenger conversations with AI agents, built with React, Node.js, and Supabase.

## 🚀 Features

- **AI Agent Management**: Create and configure AI agents with custom personalities
- **Facebook Page Integration**: Connect multiple Facebook pages
- **Real-time Messaging**: Live updates for conversations and messages
- **Smart Sync**: Sync conversations from Facebook (recent or all)
- **Conversation Management**: Organize and track all customer conversations
- **Link Management**: Manage approved links for sharing
- **Media Library**: Store and manage media files
- **User Authentication**: Secure login and session management

## 🏗️ Architecture

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Supabase Client** for real-time features

### Backend
- **Node.js** with Express
- **Supabase** for database and real-time
- **Session-based authentication**
- **Facebook Graph API** integration

### Database
- **Supabase (PostgreSQL)** with real-time capabilities
- Row Level Security (RLS)
- Optimized indexes for performance

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- Supabase account (free tier works)
- Facebook Developer account
- Facebook App with Messenger permissions

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mess2
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
cd ..
```

### 3. Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the schema from `server/config/supabase-init.sql`
3. Enable Realtime for `messages` and `conversations` tables:
   - Go to Database → Replication
   - Enable replication for both tables
4. Get your API keys from Project Settings → API

### 4. Configure Environment Variables

#### Backend (.env in /server directory)
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key

# Facebook App Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_VERIFY_TOKEN=your_webhook_verify_token
```

#### Frontend (.env in root directory)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the Application

#### Development Mode

Terminal 1 - Backend:
```bash
cd server
node server.js
```

Terminal 2 - Frontend:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend
cd server
NODE_ENV=production node server.js
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Pages
- `GET /api/pages` - Get all pages
- `POST /api/pages` - Connect page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Disconnect page
- `POST /api/pages/:id/assign-agent` - Assign agent

### Conversations
- `GET /api/conversations/page/:pageId` - Get conversations
- `POST /api/conversations/page/:pageId/sync-recent` - Sync last 5
- `POST /api/conversations/page/:pageId/sync-all` - Sync all
- `PATCH /api/conversations/:id/read` - Mark as read

### Messages
- `GET /api/messages/conversation/:conversationId` - Get messages
- `POST /api/messages/send` - Send message
- `POST /api/messages/conversation/:conversationId/sync` - Sync messages

## 🔄 Real-time Features

The application uses Supabase Realtime for live updates:

```typescript
import { realtimeService } from './services/realtimeService';

// Subscribe to messages
realtimeService.subscribeToMessages(
  conversationId,
  (newMessage) => console.log('New message:', newMessage),
  (updatedMessage) => console.log('Updated:', updatedMessage),
  (deletedId) => console.log('Deleted:', deletedId)
);

// Subscribe to conversations
realtimeService.subscribeToConversations(
  pageId,
  (newConv) => console.log('New conversation:', newConv),
  (updatedConv) => console.log('Updated:', updatedConv),
  (deletedId) => console.log('Deleted:', deletedId)
);

// Clean up
realtimeService.unsubscribeAll();
```

## 🔐 Facebook Webhook Setup

1. Go to Facebook Developer Console
2. Create a new app or use existing
3. Add Messenger product
4. Configure webhook:
   - Callback URL: `https://your-domain.com/api/webhook`
   - Verify Token: Same as `FACEBOOK_VERIFY_TOKEN` in .env
   - Subscribe to: messages, messaging_postbacks
5. Subscribe your app to a Facebook Page

## 📦 Project Structure

```
mess2/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API and realtime services
│   ├── store/             # Context and state management
│   └── types/             # TypeScript types
├── server/                # Backend source
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── public/                # Static files
└── package.json           # Dependencies
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

## 🚀 Deployment

### Backend (Node.js)
Deploy to:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

### Frontend (React)
Deploy to:
- Vercel
- Netlify
- Cloudflare Pages

### Environment Variables
Remember to set all environment variables in your deployment platform.

## 🔧 Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys
- Check if tables exist in Supabase Dashboard
- Ensure RLS policies are configured

### Real-time Not Working
- Enable replication in Supabase Dashboard
- Check browser console for WebSocket errors
- Verify Anon Key is correct

### Webhook Not Receiving
- Ensure URL is publicly accessible
- Verify webhook subscription in Facebook
- Check verify token matches

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] AI response generation
- [ ] Sentiment analysis
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app
- [ ] WhatsApp integration

## ⚡ Quick Start Commands

```bash
# Install all dependencies
npm install && cd server && npm install && cd ..

# Start development servers (requires 2 terminals)
# Terminal 1:
cd server && node server.js

# Terminal 2:
npm run dev

# Build for production
npm run build

# Run production server
cd server && NODE_ENV=production node server.js
```

## 📖 Additional Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md) - Detailed Supabase configuration
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Setup Guide](SETUP.md) - Quick setup instructions

---

Built with ❤️ using React, Node.js, and Supabase