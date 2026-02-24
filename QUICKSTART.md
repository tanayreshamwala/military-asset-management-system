# Quick Start Guide

Get the Military Asset Management System running in 10 minutes.

## Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org))
- **MongoDB** 5.0+ ([Download](https://www.mongodb.com/try/download/community) or use [Atlas](https://mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com))

## 🚀 Start Backend

### 1. Install & Configure

```bash
cd backend
npm install
```

Edit `backend/.env` (already configured):

```
MongoDB running locally: mongodb://localhost:27017/military-asset-management
```

### 2. Start MongoDB (if local)

**Docker:**

```bash
docker run -d -p 27017:27017 mongo:5.0
```

**Or manually:**

```bash
mongod
```

### 2.1 Enable Replica Set for Local Transactions (Recommended)

Inventory operations use MongoDB transactions. On a standalone MongoDB server, you may get:

`Transaction numbers are only allowed on a replica set member or mongos`

Set up a single-node replica set locally:

```powershell
# Stop MongoDB service
net stop MongoDB
```

Add this to `mongod.cfg`:

```yaml
replication:
  replSetName: rs0
```

```powershell
# Start MongoDB service
net start MongoDB

# Initialize replica set once
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"

# Verify
mongosh --eval "rs.status().ok"
```

Update `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/military-asset-management?replicaSet=rs0
```

### 3. Seed Database

```bash
npm run seed
```

Outputs:

```
✅ Database seeded successfully
```

### 4. Start Server

```bash
npm run dev
```

Output:

```
🚀 Server running on http://localhost:5000
```

✅ Backend ready!

---

## 🎨 Start Frontend

### 1. Install & Start

```bash
cd frontend
npm install
npm run dev
```

Output:

```
➜ Local: http://localhost:5173
```

✅ Frontend ready!

---

## 🔓 Login

Visit http://localhost:5173

### Use Demo Credentials

**Admin** (Full access)

- Email: `admin@military.com`
- Password: `Admin@123`

**Commander** (Base restricted)

- Email: `commander@military.com`
- Password: `Commander@123`

**Logistics Officer** (Purchase/transfer)

- Email: `logistics@military.com`
- Password: `Logistics@123`

---

## 📊 Explore Features

### 1. Dashboard

- View metrics: opening balance, current balance, transfers
- See low-stock alerts
- Monitor transaction counts

### 2. Assets

- Admin: Create, edit, delete assets
- View all asset types (Vehicle, Weapon, Ammunition, Equipment)

### 3. Purchases

- Logistics Officer: Record purchases
- Automatically increases inventory
- View purchase history

### 4. Transfers

- Logistics Officer: Move assets between bases
- Validates sufficient stock
- Prevents negative inventory

### 5. Assignments

- Base Commander: Assign assets to personnel
- Automatically deducts inventory
- Track who has what

### 6. Expenditures

- Base Commander: Record asset consumption
- Specify reason for removal
- Maintain history

### 7. Users (Admin only)

- Create users with roles
- Assign to bases
- Update/delete users

### 8. Audit Logs (Admin only)

- View complete action history
- Filter by user, entity type, date
- Track all changes

---

## 🧪 Test Inventory Transactions

1. **Login as Admin**
2. **View Dashboard** → Note opening balance
3. **Login as Logistics Officer**
4. **Record Purchase** → Add 20 units
5. **View Dashboard** → Inventory increased
6. **Record Transfer** → Move 10 units to another base
7. **Dashboard** → Changes reflected

**Negative Inventory Prevention:**

- Try to transfer more than available
- System prevents with error message

---

## 🔧 API Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@military.com","password":"Admin@123"}'
```

### Get Dashboard

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/BASEID
```

---

## 📁 Key Files

**Backend**

- `server.js` - Entry point
- `src/app.js` - Express app
- `src/services/` - Business logic
- `src/models/` - Database schemas
- `src/routes/` - API endpoints

**Frontend**

- `src/main.jsx` - Entry point
- `src/App.jsx` - Main component
- `src/pages/` - Route pages
- `src/context/AuthContext.jsx` - Auth state
- `src/api/endpoints.js` - API calls

---

## 🆘 Troubleshooting

### MongoDB Connection Error

**Problem:** `MongoError: connect ECONNREFUSED`

**Solution:**

```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:5.0

# Or check if running
ps aux | grep mongod
```

### Port Already in Use

**Problem:** `Address already in use :::5000`

**Solution:**

```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### CORS Error in Frontend

**Problem:** `Access to XMLHttpRequest has been blocked by CORS`

**Solution:**

- Ensure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Clear browser cache and localStorage

### Wrong Credentials

**Problem:** Cannot login

**Solution:**

- Use exact demo credentials (case-sensitive)
- Check `.env` JWT_SECRET matches
- Reseed database: `npm run seed`

---

## 🚀 Next Steps

### Deploy to Production

1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Set up MongoDB Atlas
3. Deploy backend to Render
4. Deploy frontend to Vercel

### Customize

- Update `requirements.md` and `architecture.md` with your changes
- Add new asset types in Asset model
- Create custom roles as needed

### Extend

- Add more reporting features
- Implement file uploads
- Add email notifications
- Integrate with external systems

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Architecture details

---

## ✨ Success!

You now have a fully functional Military Asset Management System running locally!

Next: Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production.

Questions? Check the documentation files or the code comments.

Happy coding! 🎖️
