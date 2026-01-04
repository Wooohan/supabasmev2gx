# MessengerFlow - Server-Based Backend Migration

## Overview
Convert the current IndexedDB-based frontend application to a full-stack application with:
- Express.js backend server
- MongoDB database (Atlas connection)
- RESTful API endpoints
- Same frontend functionality with API integration

## Database Schema (MongoDB Collections)

### 1. agents
- id (string, unique)
- name (string)
- email (string, unique)
- password (string, hashed)
- role (SUPER_ADMIN | AGENT)
- avatar (string, URL)
- status (online | offline | busy)
- assignedPageIds (array of strings)

### 2. pages
- id (string, unique)
- name (string)
- category (string)
- isConnected (boolean)
- accessToken (string)
- assignedAgentIds (array of strings)

### 3. conversations
- id (string, unique)
- pageId (string)
- customerId (string)
- customerName (string)
- customerAvatar (string)
- lastMessage (string)
- lastTimestamp (string)
- status (OPEN | PENDING | RESOLVED)
- assignedAgentId (string, nullable)
- unreadCount (number)

### 4. messages
- id (string, unique)
- conversationId (string)
- senderId (string)
- senderName (string)
- text (string)
- timestamp (string)
- isIncoming (boolean)
- isRead (boolean)
- notes (string, optional)

### 5. links
- id (string, unique)
- title (string)
- url (string)
- category (string)

### 6. media
- id (string, unique)
- title (string)
- url (string)
- type (image | video)
- isLocal (boolean, optional)

## Backend Implementation Tasks

1. **server/config/database.js** - MongoDB connection setup
2. **server/models/** - Mongoose schemas for all collections
3. **server/routes/** - API routes for CRUD operations
4. **server/controllers/** - Business logic handlers
5. **server/middleware/auth.js** - Authentication middleware
6. **server/server.js** - Main Express server setup
7. **server/package.json** - Backend dependencies

## Frontend Integration Tasks

1. **services/apiService.ts** - Replace dbService with HTTP API calls
2. **store/AppContext.tsx** - Update to use apiService instead of dbService
3. Update all components to handle async API calls properly
4. Add loading states and error handling

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout

### Agents
- GET /api/agents
- POST /api/agents
- PUT /api/agents/:id
- DELETE /api/agents/:id

### Pages
- GET /api/pages
- POST /api/pages
- PUT /api/pages/:id
- DELETE /api/pages/:id

### Conversations
- GET /api/conversations
- POST /api/conversations
- PUT /api/conversations/:id
- DELETE /api/conversations/:id

### Messages
- GET /api/messages/:conversationId
- POST /api/messages
- POST /api/messages/bulk

### Links
- GET /api/links
- POST /api/links
- DELETE /api/links/:id

### Media
- GET /api/media
- POST /api/media
- DELETE /api/media/:id

## Development Steps
1. Create backend server structure
2. Implement MongoDB models
3. Create API routes and controllers
4. Update frontend services
5. Test all functionality
6. Deploy and verify