# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
npm run install:server
```

### 2. Start Everything
```bash
npm start
```

This will start both:
- Backend API on http://localhost:5000
- Frontend on http://localhost:5173

### 3. Login
Open http://localhost:5173 and login with:
- **Email**: `wooohan3@gmail.com`
- **Password**: `Admin@1122`

## ✅ Verification Checklist

After starting, verify:

1. **Backend is running**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **MongoDB connected**
   Check terminal output for:
   ```
   ✅ MongoDB Connected: cluster0-shard-...
   📊 Database: MessengerFlow
   ```

3. **Frontend loads**
   - Open http://localhost:5173
   - Should see login page

4. **Login works**
   - Enter credentials
   - Should redirect to dashboard

## 🔍 Testing Features

### Test 1: Create an Agent
1. Login as admin
2. Go to "Agents" tab
3. Click "Add New Agent"
4. Fill form and submit
5. Check MongoDB - new agent should appear in `Test` collection

### Test 2: Connect Facebook Page
1. Go to "Pages" tab
2. Click "Connect Facebook Page"
3. Login with Facebook
4. Select a page
5. Page should appear in list

### Test 3: View Conversations
1. Go to "Inbox" tab
2. Click "Sync Conversations"
3. Conversations from connected pages should load

## 🐛 Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Connection string is correct in `server/.env`

### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### Issue: "CORS error"
**Solution**:
- Ensure backend is running on port 5000
- Frontend is on port 5173
- Check `server/server.js` CORS configuration

### Issue: "Session not persisting"
**Solution**:
- Clear browser cookies
- Restart backend server
- Check MongoDB session store connection

## 📊 Database Verification

### Check if data is being stored:

1. **Via MongoDB Compass**:
   - Connect to: `mongodb+srv://Zayn:Temp1122@cluster0.orvyxn0.mongodb.net/`
   - Database: `MessengerFlow`
   - Collection: `Test`
   - Should see agents, pages, conversations, etc.

2. **Via MongoDB Atlas Web UI**:
   - Login to MongoDB Atlas
   - Browse Collections
   - Database: `MessengerFlow`
   - Collection: `Test`

3. **Via API**:
   ```bash
   # Get all agents (requires login first)
   curl -X GET http://localhost:5000/api/agents \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
   ```

## 🎯 Next Steps

1. **Customize**: Update branding, colors, logos
2. **Facebook Integration**: Add your Facebook App ID in `services/facebookService.ts`
3. **Deploy**: Follow deployment guide in README.md
4. **Scale**: Add more agents, connect more pages

## 💡 Tips

- **Development**: Use `npm run server:dev` for auto-restart on code changes
- **Debugging**: Check browser console and terminal for errors
- **Testing**: Use Postman/Insomnia to test API endpoints
- **Monitoring**: Check MongoDB Atlas for query performance

## 📞 Support

If you encounter issues:
1. Check terminal output for error messages
2. Verify all environment variables are set
3. Ensure MongoDB Atlas IP whitelist allows your IP
4. Check browser console for frontend errors

---

**Ready to go!** 🎉 Your MessengerFlow portal should now be fully functional with MongoDB backend.