# Deployment Guide

## Prerequisites

### For Local Development

- Node.js 16+ with npm
- MongoDB 5.0+ (local or MongoDB Atlas)
- Git

### For Production

- MongoDB Atlas account or self-hosted MongoDB
- Render account (for backend)
- Vercel account (for frontend)
- Domain name (optional)

---

## Local Development Setup

### 1. Clone and Install Backend

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/military-asset-management
JWT_SECRET=your-dev-secret-key-here
JWT_EXPIRY=1h
# LOG_LEVEL removed (console logging in use)
```

### 3. Start MongoDB

**Using Docker:**

```bash
docker run -d -p 27017:27017 --name mongo mongo:5.0
```

**Or if installed locally:**

```bash
mongod
```

### 4. Seed Database

```bash
npm run seed
```

Creates demo users and bases:

- Admin: admin@military.com / Admin@123
- Commander: commander@military.com / Commander@123
- Logistics: logistics@military.com / Logistics@123

### 5. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 6. Install and Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Production Deployment

### Backend Deployment (Render)

1. **Prepare Repository**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Create Render Service**
   - Go to https://render.com
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub repository
   - Choose "military-asset-management-system" repo
   - Set up:
     - **Name**: military-asset-api
     - **Runtime**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `npm run start`
     - **Root Directory**: `backend`

3. **Set Environment Variables**

   ```
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/military-asset-management
   JWT_SECRET=your-production-secret-key-change-this
   FRONTEND_URL=https://military-asset.vercel.app
   # LOG_LEVEL removed (console logging in use)
   ```

4. **Create MongoDB Atlas Database**
   - Sign up at https://mongodb.com/cloud/atlas
   - Create cluster (M0 free tier for testing)
   - Create database user
   - Whitelist Render IP (0.0.0.0/0 for testing, restrict in production)
   - Copy connection string to MONGO_URI

5. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys on git push
   - View logs: https://dashboard.render.com

6. **Seed Production Database**
   ```bash
   # SSH into Render instance or use MongoDB Atlas Tools
   # Run seed with production URI
   ```

### Frontend Deployment (Vercel)

1. **Prepare Build**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import GitHub repository
   - Configure:
     - **Framework**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables**

   ```
   VITE_API_URL=https://military-asset-api.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically deploys on git push

### Custom Domain Setup

1. **Render (Backend)**
   - In Render dashboard, go to Settings
   - Add Custom Domain
   - Update DNS records with provided values

2. **Vercel (Frontend)**
   - In Vercel dashboard, go to Settings → Domains
   - Add custom domain
   - Update DNS records

---

## Post-Deployment Configuration

### 1. Update CORS

In `backend/src/app.js`, update:

```javascript
cors({
  origin: process.env.FRONTEND_URL || "https://yourdomain.com",
  credentials: true,
});
```

### 2. Database Backup

**MongoDB Atlas:**

- Enable automated backups (Atlas M2+ plans)
- Download point-in-time backups

**Manual Backup:**

```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/database" \
  --out=/path/to/backup
```

### 3. Monitoring

Set up monitoring for:

- Backend uptime (Render dashboard)
- Database performance (MongoDB Atlas)
- Error tracking (optional: Sentry)

### 4. SSL/HTTPS

- Render: Automatic with custom domain
- Vercel: Automatic with custom domain
- Ensure all API calls use HTTPS

---

## Scaling Considerations

### Database

- Add indexes for high-traffic operations
- Use MongoDB read replicas for scaling reads
- Enable connection pooling

### Backend

- Deploy multiple instances on Render
- Use load balancer (Render handles this)
- Cache frequently accessed data (Redis)

### Frontend

- Vercel handles CDN automatically
- Enable image optimization
- Cache static assets

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Test connection
npm run test-db

# Check URI format:
mongodb+srv://username:password@cluster.mongodb.net/database
```

### CORS Errors

- Check FRONTEND_URL environment variable
- Ensure credentials: true in CORS config
- Test with curl:

```bash
curl -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.yourdomain.com/api/health
```

### Token Expiry Issues

- Verify JWT_SECRET matches between deployments
- Check token expiry time
- Ensure client clock is synchronized

### Database Quota Issues

- Upgrade MongoDB Atlas plan
- Delete old logs/audit data
- Optimize queries

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Whitelist MongoDB IP addresses
- [ ] Enable HTTPS for all endpoints
- [ ] Configure CORS for production domain only
- [ ] Set up environment-based configuration
- [ ] Enable database encryption at rest
- [ ] Regular security updates for dependencies
- [ ] Implement rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Enable audit logging monitoring
- [ ] Regular database backups
- [ ] Incident response plan

---

## Maintenance

### Regular Tasks

**Weekly:**

- Check application logs
- Monitor error rates
- Verify backups

**Monthly:**

- Update dependencies: `npm audit`
- Review audit logs for suspicious activity
- Check database performance

**Quarterly:**

- Full database backup test
- Disaster recovery drill
- Security audit

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update production dependencies
npm update

# Update specific package
npm install package@latest

# Check for security vulnerabilities
npm audit
npm audit fix
```

### Database Maintenance

```bash
# Monitor slow queries
db.getProfilingLevel()
db.setProfilingLevel(1)

# Rebuild indexes
db.collection.reIndex()

# Remove old audit logs
db.AuditLog.deleteMany({ timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) } })
```

---

## Rollback Procedure

### Backend (Render)

1. Go to Render dashboard
2. Select military-asset-api
3. Click "Deploy" → "View Deployments"
4. Select previous stable version
5. Click "Rollback"

### Frontend (Vercel)

1. Go to Vercel dashboard
2. Select project
3. Click "Deployments"
4. Click three dots on previous version
5. Select "Rollback to this Deployment"

### Database

- Restore from MongoDB Atlas backup
- Or use mongorestore if manual backup exists

---

## Performance Optimization

### Backend

```javascript
// Enable compression
app.use(compression());

// Add caching headers
app.use(express.static("public", { maxAge: "1h" }));

// Use aggregation pipeline for complex queries
```

### Database

```javascript
// Add indexes for frequently queried fields
db.inventory.createIndex({ baseId: 1, assetId: 1 });
db.auditlogs.createIndex({ createdAt: -1 });

// Use projections to limit returned fields
db.inventory.find({}, { currentQuantity: 1, assetId: 1 });
```

### Frontend

```javascript
// Code splitting
const Dashboard = lazy(() => import("./pages/DashboardPage.jsx"));

// Image optimization
import { Image } from "next/image";
```

---

## Cost Estimation

### Monthly Costs (Estimated)

**Development:**

- MongoDB Atlas M0: FREE
- Render Free: FREE
- Vercel: FREE
- **Total: $0**

**Production (Low Volume):**

- MongoDB Atlas M2: $57/month
- Render Pro: $7/month
- Vercel Pro: $20/month
- Domain: $10/year
- **Total: ~$85/month**

**Production (High Volume):**

- MongoDB Atlas M10: $116/month
- Render Standard: $25/month
- Vercel Pro: $20/month
- Domain: $10/year
- **Total: ~$170/month**
