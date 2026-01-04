# Deployment Guide - MessengerFlow

## 🚀 Production Deployment

### Backend Deployment (Railway / Render / Heroku)

#### Option 1: Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   cd server
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="mongodb+srv://Zayn:Temp1122@cluster0.orvyxn0.mongodb.net/?appName=Cluster0"
   railway variables set DB_NAME="MessengerFlow"
   railway variables set SESSION_SECRET="your-production-secret-key"
   railway variables set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Your URL**
   ```bash
   railway domain
   ```

#### Option 2: Render

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `messengerflow-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://Zayn:Temp1122@cluster0.orvyxn0.mongodb.net/?appName=Cluster0
   DB_NAME=MessengerFlow
   SESSION_SECRET=your-production-secret-key
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

#### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd server
   heroku create messengerflow-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://Zayn:Temp1122@cluster0.orvyxn0.mongodb.net/?appName=Cluster0"
   heroku config:set DB_NAME="MessengerFlow"
   heroku config:set SESSION_SECRET="your-production-secret-key"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a messengerflow-api
   git push heroku main
   ```

### Frontend Deployment (Vercel / Netlify)

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Update Environment**
   Create `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

3. **Deploy**
   ```bash
   cd /workspace/mess2
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add `VITE_API_URL` environment variable

#### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add `VITE_API_URL`

### Post-Deployment Configuration

#### 1. Update CORS Settings

In `server/server.js`, update the CORS origin:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:5173' // Keep for local development
  ],
  credentials: true,
}));
```

#### 2. Update Session Cookie Settings

In `server/server.js`:

```javascript
cookie: {
  secure: true, // Enable in production
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'none', // Required for cross-origin cookies
  domain: '.your-domain.com' // Optional: for subdomain sharing
}
```

#### 3. MongoDB Atlas Configuration

1. **Whitelist IP Addresses**
   - Go to MongoDB Atlas
   - Network Access → Add IP Address
   - For production: Add your server's IP or use 0.0.0.0/0 (not recommended for production)

2. **Create Production User** (Optional)
   ```
   Username: messengerflow_prod
   Password: [generate strong password]
   Role: readWrite on MessengerFlow database
   ```

#### 4. SSL/HTTPS

- Both Railway and Render provide automatic HTTPS
- Vercel and Netlify provide automatic HTTPS
- Ensure all API calls use HTTPS in production

### Environment Variables Summary

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://Zayn:Temp1122@cluster0.orvyxn0.mongodb.net/?appName=Cluster0
DB_NAME=MessengerFlow
PORT=5000
SESSION_SECRET=your-super-secret-production-key-change-this
NODE_ENV=production
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

## 🔒 Security Checklist

- [ ] Change `SESSION_SECRET` to a strong random string
- [ ] Use environment-specific MongoDB credentials
- [ ] Enable HTTPS on all services
- [ ] Configure CORS properly
- [ ] Set secure cookie flags in production
- [ ] Whitelist specific IPs in MongoDB Atlas
- [ ] Enable rate limiting (add express-rate-limit)
- [ ] Add helmet.js for security headers
- [ ] Implement request logging
- [ ] Set up monitoring and alerts

## 📊 Monitoring

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "MessengerFlow API is running",
  "timestamp": "2024-01-02T..."
}
```

### Frontend Check
Visit: `https://your-frontend-domain.vercel.app`

### MongoDB Monitoring
- Use MongoDB Atlas monitoring dashboard
- Set up alerts for high CPU/memory usage
- Monitor slow queries

## 🐛 Troubleshooting Production Issues

### Issue: 502 Bad Gateway
**Cause**: Backend not responding
**Solution**: 
- Check backend logs
- Verify MongoDB connection
- Restart backend service

### Issue: CORS Errors
**Cause**: Frontend domain not whitelisted
**Solution**: Update CORS configuration in `server/server.js`

### Issue: Session Not Persisting
**Cause**: Cookie settings incompatible with cross-origin
**Solution**: 
- Set `sameSite: 'none'`
- Ensure `secure: true`
- Both frontend and backend must use HTTPS

### Issue: MongoDB Connection Timeout
**Cause**: IP not whitelisted or connection string incorrect
**Solution**:
- Check MongoDB Atlas Network Access
- Verify connection string
- Check server logs for detailed error

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📈 Scaling Considerations

### Database
- Use MongoDB Atlas auto-scaling
- Consider sharding for large datasets
- Implement database indexes for common queries

### Backend
- Use load balancer for multiple instances
- Implement caching (Redis)
- Use CDN for static assets

### Frontend
- Vercel/Netlify handle scaling automatically
- Use CDN for assets
- Implement code splitting

## 💰 Cost Estimation

### Free Tier Options
- **MongoDB Atlas**: Free tier (512MB)
- **Railway**: $5/month with $5 free credit
- **Render**: Free tier available
- **Vercel**: Free for hobby projects
- **Netlify**: Free for personal projects

### Paid Recommendations
- **MongoDB Atlas**: M10 cluster (~$57/month)
- **Railway**: Pro plan ($20/month)
- **Vercel**: Pro plan ($20/month)

**Total Estimated Cost**: $0-100/month depending on usage

## 📝 Post-Deployment Tasks

1. **Test All Features**
   - Login/logout
   - Agent creation
   - Facebook page connection
   - Conversation sync
   - Message sending

2. **Set Up Monitoring**
   - Backend uptime monitoring
   - Error tracking (Sentry)
   - Performance monitoring

3. **Documentation**
   - Update API documentation
   - Create user guide
   - Document deployment process

4. **Backup Strategy**
   - MongoDB Atlas automated backups
   - Export critical data regularly
   - Document recovery procedures

---

**Deployment Complete!** 🎉 Your MessengerFlow portal is now live in production.