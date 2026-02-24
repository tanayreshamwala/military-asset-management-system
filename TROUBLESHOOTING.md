# Troubleshooting Guide - Military Asset Management System

## 🔧 Common Issues & Solutions

This guide helps troubleshoot common problems when developing, deploying, or operating the system.

---

## 🚀 Installation & Startup Issues

### Issue: "npm install" fails

**Symptoms:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache**

```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

2. **Force legacy peer deps (Node 16+)**

```bash
npm install --legacy-peer-deps
```

3. **Use newer Node version**

```bash
node --version  # Should be 16+
nvm install 18
nvm use 18
npm install
```

---

### Issue: "MongoDB connection refused"

**Symptoms:**

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Start MongoDB locally**

```bash
# Windows
# Make sure MongoDB service is running
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

2. **Check MongoDB connection string in .env**

```env
# Should be correct for your setup
MONGO_URI=mongodb://localhost:27017/military-assets
```

3. **Verify MongoDB is running**

```bash
mongo --eval "db.version()"
# or
mongosh --eval "db.version()"
```

4. **Check firewall/port 27017**

```bash
netstat -an | grep 27017  # Should see LISTEN
```

---

### Issue: "Cannot find module" error

**Symptoms:**

```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Install missing dependency**

```bash
npm install express
```

2. **Ensure correct working directory**

```bash
cd backend  # or cd frontend
npm install
```

3. **Check package.json exists**

```bash
ls -la
# Should show package.json
```

---

### Issue: Port already in use

**Symptoms:**

```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

1. **Kill process using port (Windows)**

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

2. **Kill process using port (macOS/Linux)**

```bash
lsof -i :5000
kill -9 <PID>
```

3. **Use different port**

```bash
# In backend .env
PORT=5001

# In frontend vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5001'
  }
}
```

---

## 🔐 Authentication Issues

### Issue: "Cannot login - Invalid credentials"

**Symptoms:**

```
Error: Invalid email or password
```

**Solutions:**

1. **Verify demo credentials**

```
Email: admin@military.com
Password: Admin@123   (capital A, capital A after number)
```

2. **Check password hashing in database**

```javascript
// Run in Node shell
const bcrypt = require("bcryptjs");
bcrypt
  .compare("Admin@123", hashedPasswordFromDB)
  .then((match) => console.log(match)); // Should be true
```

3. **Verify user exists in database**

```bash
# MongoDB shell
db.users.findOne({ email: 'admin@military.com' })
# Should return user object
```

4. **Check JWT_SECRET is set in .env**

```env
JWT_SECRET=your-super-secret-key-change-in-production
```

---

### Issue: "Unauthorized - Token expired/invalid"

**Symptoms:**

```
Error: 401 Unauthorized
Token expired
```

**Solutions:**

1. **Clear localStorage and login again**

```javascript
// In browser console
localStorage.clear();
// Then login via UI
```

2. **Check Authorization header format**

```bash
# Should be: Bearer <token>
# NOT: Bearer<token> or <token>
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..." \
  http://localhost:5000/api/auth/me
```

3. **Verify JWT_SECRET matches**

```env
# Backend .env
JWT_SECRET=same-secret-used-for-token

# If changed, all tokens become invalid
# Users must login again
```

4. **Check token expiry**

```bash
# Decode JWT (use jwt.io or Node)
const decoded = require('jsonwebtoken').decode(token);
console.log(new Date(decoded.exp * 1000)); // Expiry time
```

---

### Issue: "Access denied - Insufficient permissions"

**Symptoms:**

```
Error: 403 Forbidden
```

**Solutions:**

1. **Verify user role**

```bash
# MongoDB shell
db.users.findOne({ email: 'user@example.com' }).role
# Should be: 'admin', 'base_commander', or 'logistics_officer'
```

2. **Check role has endpoint permission**

- Admin: All endpoints
- Base Commander: Inventory (own base), assignments, expenditures
- Logistics Officer: Purchases, transfers

3. **Verify baseId for non-admin users**

```bash
db.users.findOne({ email: 'user@example.com' }).baseId
# Must be assigned a base
```

4. **Check RBAC middleware on route**

```javascript
// Should have authorizeRoles middleware
router.post(
  "/endpoint",
  authenticate,
  authorizeRoles("admin", "base_commander"), // ← Check this
  maintenanceController.createMaintenance,
);
```

---

## 💾 Database Issues

### Issue: "Connection timeout"

**Symptoms:**

```
MongooseError: Cannot connect to MongoDB
Timeout after 30 seconds
```

**Solutions:**

1. **Check MongoDB version compatibility**
   - MongoDB 4.0+ supports transactions
   - M2+ tier on MongoDB Atlas supports transactions

```bash
mongo --version
```

2. **Verify connection string for MongoDB Atlas**

```env
# Should include credentials
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

3. **Check IP whitelist (MongoDB Atlas)**
   - Go to MongoDB Atlas → Network Access
   - Add your IP or 0.0.0.0/0 for development
   - Wait 1-2 minutes for changes

4. **Check network connectivity**

```bash
# Test connection to MongoDB Atlas
ping cluster.mongodb.net
# or
curl https://cluster.mongodb.net
```

---

### Issue: "Transaction aborted"

**Symptoms:**

```
AbortedDueToDirectiveConflict
Cannot create transaction with stale txnNumber
```

**Solutions:**

1. **Ensure MongoDB supports transactions (4.0+)**

```bash
mongo --eval "db.version()"
```

2. **Check session is passed to all operations**

```javascript
// ❌ Wrong - not passing session
const result = Model.updateOne({ _id: id }, data);

// ✅ Correct - passing session
const result = Model.updateOne({ _id: id }, data, { session });
```

3. **Verify MongoDB Atlas tier supports transactions**
   - M2+ tier required
   - M0 free tier does NOT support transactions

4. **Check for topology issues**

```bash
# Restart MongoDB
sudo systemctl restart mongod
```

---

### Issue: "Transaction numbers are only allowed on a replica set member or mongos"

**Symptoms:**

```
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
```

**Cause:**

MongoDB is running in standalone mode. Transactions require a replica set (or mongos).

**Solutions (single-node replica set):**

1. **Stop MongoDB**

```powershell
net stop MongoDB
```

2. **Enable replication in `mongod.cfg`**

```yaml
replication:
  replSetName: rs0
```

3. **Start MongoDB and initialize replica set**

```powershell
net start MongoDB
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
mongosh --eval "rs.status().ok"
```

4. **Use replica-set connection string**

```env
MONGO_URI=mongodb://127.0.0.1:27017/military-asset-management?replicaSet=rs0
```

---

### Issue: "Duplicate key error"

**Symptoms:**

```
E11000 duplicate key error collection
```

**Solutions:**

1. **Check indices**

```bash
db.users.getIndexes()
# Should show email has unique: true
```

2. **Clear duplicate data**

```bash
# Remove duplicates
db.users.deleteMany({ email: 'duplicate@example.com' }, { justOne: false })

# Or drop collection and re-seed
db.users.drop()
npm run seed
```

3. **Check model schema**

```javascript
// Email should have unique constraint
email: {
  type: String,
  unique: true,   // ← Must have this
  required: true
}
```

---

### Issue: "Data not persisting"

**Symptoms:**

- Add record → Doesn't show after refresh
- Update data → Reverts to old value

**Solutions:**

1. **Check transaction commits**

```javascript
// Must call commitTransaction
await session.commitTransaction();
// NOT just abortTransaction
```

2. **Verify no async errors in transaction**

```javascript
// All operations must await
await Model.updateOne({}, {}, { session }); // ✅
Model.updateOne({}, {}, { session }); // ❌
```

3. **Check errorHandler catches all errors**

```javascript
// Use asyncHandler wrapper
router.post(
  "/endpoint",
  asyncHandler(async (req, res) => {
    // All errors caught and transaction aborted
  }),
);
```

---

## 🎨 Frontend Issues

### Issue: "API calls failing with CORS error"

**Symptoms:**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Check CORS configuration in backend**

```javascript
// app.js should have
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:5173", "https://yourdomain.com"],
    credentials: true,
  }),
);
```

2. **Check API URL in frontend .env**

```env
VITE_API_URL=http://localhost:5000/api
```

3. **Check request headers**

```javascript
// axios client should add Content-Type
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

4. **Verify Vite proxy configuration** (dev only)

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
```

---

### Issue: "Token not being sent with requests"

**Symptoms:**

```
401 Unauthorized on every request
```

**Solutions:**

1. **Check token stored in localStorage**

```javascript
// In browser console
console.log(localStorage.token);
// Should output JWT
```

2. **Verify axios interceptor is set**

```javascript
// api/client.js should have
request.interceptors.request.use((config) => {
  const token = localStorage.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. **Check token format in localStorage**

```javascript
// Should be plain JWT without "Bearer " prefix
// AuthContext handles adding "Bearer "
const token = localStorage.getItem("token");
console.log(token.substring(0, 50)); // Should look like eyJhbGc...
```

---

### Issue: "Page not loading - blank screen"

**Symptoms:**

- White/blank page
- No errors in browser console

**Solutions:**

1. **Check browser console for errors**
   - F12 → Console tab
   - Look for red error messages

2. **Check network tab for failed requests**
   - F12 → Network tab
   - Look for 404/500 responses

3. **Verify Vite dev server running**

```bash
# Should see
VITE v4.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

4. **Check React errors**

```javascript
// Look for React error boundary message
// Or check browser console for React errors
```

5. **Clear browser cache**

```bash
# Ctrl+Shift+Delete (Windows)
# Cmd+Shift+Delete (Mac)
# Then hard refresh Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

---

### Issue: "Form not submitting"

**Symptoms:**

- Click submit button → Nothing happens
- No error messages

**Solutions:**

1. **Check form validation**

```javascript
// Verify all required fields have values
// Check validation rules in Form.Item
rules={[{ required: true, message: 'Field required' }]}
```

2. **Check Form instance import**

```jsx
// ✅ Correct
const [form] = Form.useForm();

// Then use in onFinish
onFinish={(values) => handleSubmit(values)}
```

3. **Check API endpoint URL**

```javascript
// endpoints.js should have correct path
POST / api / endpoint;
// Check port matches backend (5000)
```

4. **Check for network errors**
   - F12 → Network tab
   - Look for failed requests with error details

---

### Issue: "Dashboard metrics showing 0"

**Symptoms:**

- All metric cards show 0
- No data displayed

**Solutions:**

1. **Verify opening balance is set**

```bash
db.inventories.findOne()
# Should have openingBalance > 0
```

2. **Check aggregation pipeline in dashboardService**

```javascript
// Should group by assetId and sum quantities
$group: {
  _id: '$assetId',
  total: { $sum: '$currentQuantity' }
}
```

3. **Verify baseId parameter passed correctly**

```javascript
// Frontend should pass current user's baseId
const { baseId } = useContext(AuthContext);
dashboardAPI.getDashboard(baseId);
```

4. **Check database has data**

```bash
db.inventories.countDocuments()
# Should be > 0
db.purchases.countDocuments()
# Should be > 0
```

---

## 📊 Data Issues

### Issue: "Inventory went negative"

**Symptoms:**

- Inventory can be decremented below 0
- No validation prevents this

**Solutions:**

1. **Check validation in inventoryService**

```javascript
// Before deducting, validate sufficient quantity
if (inventory.currentQuantity < quantity) {
  throw new AppError("Insufficient stock", 400);
}
```

2. **Check transaction is in place**

```javascript
// Must use transaction for multi-step operations
const session = await mongoose.startSession();
session.startTransaction();
```

3. **Check ORIGINAL validation runs**

```javascript
// Validation should run BEFORE transaction
const inventory = await Inventory.findById(inventoryId);
if (!inventory || inventory.currentQuantity < quantity) {
  throw new Error("Insufficient");
}
await transaction();
```

---

### Issue: "Audit log missing entries"

**Symptoms:**

- Operations don't create audit records
- Audit log is empty

**Solutions:**

1. **Check auditService is called**

```javascript
// Service should call after state change
await auditService.logAction({
  userId: req.user.id,
  action: "ASSET_CREATED",
  entityType: "Asset",
  entityId: asset._id,
  newState: asset,
});
```

2. **Check error handling doesn't skip audit**

```javascript
// ❌ Wrong - audit skipped on error
const item = await Model.create(data);
return res.json(item);  // If this throws, audit not logged

// ✅ Correct - audit in transaction
try {
  const item = await Model.create(data, { session });
  await auditService.logAction({...}, { session });
  await session.commitTransaction();
}
```

3. **Verify AuditLog collection exists**

```bash
db.auditlogs.countDocuments()
# Should be > 0
```

---

### Issue: "Data discrepancies between bases"

**Symptoms:**

- Transfers showing wrong quantities
- Inventory totals don't match

**Solutions:**

1. **Check baseId enforcement in service**

```javascript
// Non-admin users must use their baseId
const baseId = req.user.role === "admin" ? req.body.baseId : req.user.baseId;
```

2. **Verify transfer deduction is bidirectional**

```javascript
// Must deduct from source AND add to destination in transaction
// Not just one or the other
```

3. **Audit transfer records**

```bash
db.transfers.find({ fromBaseId: ObjectId(...) })
# Verify quantities are correct
```

---

## 🌐 Deployment Issues

### Issue: "Deployed backend returns CORS error"

**Symptoms:**

```
Access to XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Solutions:**

1. **Update CORS origin in production**

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

2. **Set FRONTEND_URL in .env (production)**

```env
FRONTEND_URL=https://yourdomain.vercel.app
NODE_ENV=production
```

3. **Check allowed methods**

```javascript
cors({
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

### Issue: "Frontend can't connect to deployed backend"

**Symptoms:**

```
404 / 500 on API requests
NetworkError when attempting to fetch resource
```

**Solutions:**

1. **Verify backend URL in frontend .env**

```env
VITE_API_URL=https://backend-app-name.onrender.com/api
```

2. **Check backend is running**

```bash
# From terminal:
curl https://backend-app-name.onrender.com/api/auth/me
# Should return 401 (no token), not 404
```

3. **Check MongoDB Atlas whitelist**
   - Backend IP must be whitelisted
   - Or set to 0.0.0.0/0

4. **Verify environment variables on platform**
   - Render/Vercel dashboard
   - Check MONGO_URI, JWT_SECRET are set
   - Check no typos in variable names

---

### Issue: "Database operations slow in production"

**Symptoms:**

- Dashboard takes 5+ seconds to load
- API responses timeout

**Solutions:**

1. **Add database indexes**

```javascript
// Models should have indexes
schema.index({ baseId: 1, assetId: 1 });
schema.index({ status: 1, createdAt: -1 });
```

2. **Verify indexes created in MongoDB**

```bash
# MongoDB shell
db.inventories.getIndexes()
# Should show indexes you created
```

3. **Optimize aggregation pipeline**

```javascript
// $match early to filter documents
{ $match: { baseId: ObjectId(...) } },
// Then $group
{ $group: { _id: '$assetId', total: { $sum: 1 } } }
```

4. **Check connection pooling**

```env
MONGO_URI=mongodb+srv://...?maxPoolSize=50&minPoolSize=10
```

---

### Issue: "Memory leaks in production"

**Symptoms:**

- Application crashes after running for hours
- Memory usage keeps increasing

**Solutions:**

1. **Ensure connection closed properly**

```javascript
// server.js should have proper shutdown
process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  server.close();
});
```

2. **Check no circular references in services**

```javascript
// Don't keep references to request/response objects
// Don't store large objects in module scope
```

3. **Verify event listeners removed**

```javascript
// In services, remove listeners after use
emitter.removeListener("event", handler);
```

4. **Check backend console output**

```javascript
// Logs are written to console
// Use deployment/platform log viewer for retention/rotation
```

---

## 📋 Performance Optimization

### Slow Dashboard Query

**Issue:** Dashboard loads slowly

**Solution:**

```javascript
// Use aggregation pipeline to compute in database
const metrics = await Inventory.aggregate([
  { $match: { baseId } },
  {
    $group: {
      _id: "$assetId",
      total: { $sum: "$currentQuantity" },
    },
  },
  {
    $lookup: {
      from: "assets",
      localField: "_id",
      foreignField: "_id",
      as: "asset",
    },
  },
]);
```

### Slow List Queries

**Issue:** Getting all records is slow

**Solution:**

```javascript
// Always paginate large lists
const limit = 20;
const skip = (page - 1) * limit;
const records = await Model.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });
```

---

## 🚨 Emergency Procedures

### Database Corrupted

**Steps:**

1. Stop backend: `Ctrl+C`
2. Backup current data: Export from MongoDB
3. Drop collection: `db.collection.drop()`
4. Run seed script: `npm run seed`
5. Verify data: Check MongoDB shell
6. Restart backend: `npm run dev`

### User Locked Out

```bash
# Reset password via MongoDB
db.users.updateOne(
  { email: 'user@example.com' },
  { $set: { password: 'hashedNewPassword' } }
)
```

### Token Validation Issues

```bash
# Clear all tokens by resetting JWT_SECRET
# This forces all users to login again
# Update .env JWT_SECRET and restart
```

### Lost MongoDB Connection Strings

1. Go to MongoDB Atlas → Database → Connect
2. Copy connection string
3. Update MONGO_URI in .env with credentials
4. Restart backend

---

## 📞 Getting Help

### Check Error Messages

1. Read error message carefully
2. Search message in codebase
3. Check that section of code
4. Look for validation rules

### Review Logs

```bash
# Backend logs
# Console output from running backend process

# Frontend browser console
F12 → Console tab

# Deployment logs (Render/Vercel)
Check platform dashboard for logs
```

### Enable Debug Mode

```env
# Backend
# LOG_LEVEL removed (console logging in use)
NODE_DEBUG=*

# Frontend
VITE_DEBUG=true
```

---

## ✅ Verification Checklist

Before reporting an issue:

- [ ] Restarted backend service
- [ ] Cleared browser cache
- [ ] Checked MongoDB is running
- [ ] Verified .env variables are set
- [ ] Checked error logs
- [ ] Tested with demo credentials
- [ ] Tried in different browser/incognito
- [ ] Verified database has expected data
- [ ] Checked network requests (F12)

---

## 🎯 Quick Reference

| Issue            | First Try                                 |
| ---------------- | ----------------------------------------- |
| Login fails      | Check email/password case sensitivity     |
| API 404          | Check backend port (5000) matches         |
| CORS error       | Check origin in app.js                    |
| Blank page       | Check browser console (F12)               |
| Database error   | Restart MongoDB, check connection         |
| Transaction fail | Check MongoDB supports transactions (M2+) |
| Slow queries     | Add database indexes                      |
| Memory leak      | Restart backend, check logs               |

Happy troubleshooting! 🔧
