# Military Asset Management System

A comprehensive full-stack web application for managing military assets across multiple bases with role-based access control, comprehensive audit logging, and MongoDB transactions for data integrity.

## 📋 Project Overview

This system allows military establishments to:

- Track assets (vehicles, weapons, ammunition, equipment) across multiple bases
- Manage opening balances and inventory levels
- Record purchases, transfers, assignments, and expenditures
- Maintain comprehensive audit trails for compliance
- Provide role-based dashboard with key metrics
- Prevent negative inventory with transaction-based operations

### Key Features

✅ **RBAC**: Admin, Base Commander, Logistics Officer roles  
✅ **MongoDB Transactions**: Ensures inventory integrity  
✅ **Audit Logging**: Complete action history with IP tracking  
✅ **Dashboard**: Real-time metrics and low-stock alerts  
✅ **JWT Authentication**: Secure token-based auth  
✅ **Production-Ready**: Error handling, logging, validation

## 🏗️ Architecture

### Layered Architecture

```
Frontend (React/Vite) ↔ Backend (Express) ↔ MongoDB
                           ↓
                    (Service Layer)
                    (Controllers)
                    (Middleware)
```

### Technology Stack

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Console logging
- Helmet (security headers)
- bcrypt (password hashing)

**Frontend:**

- React (JavaScript)
- Vite (bundler)
- React Router (routing)
- Material-UI + Ant Design
- Axios (HTTP client)

## 📁 Project Structure

```
military-asset-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middlewares/     # Auth, RBAC, validation, error handling
│   │   ├── utils/           # JWT, error handling
│   │   └── app.js           # Express app
│   ├── server.js            # Entry point
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── seed.js              # Database seeding
│
└── frontend/
    ├── src/
    │   ├── api/             # API client & endpoints
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Route pages
    │   ├── layouts/         # Layout components
    │   ├── context/         # Auth context
    │   ├── routes/          # Protected routes
    │   ├── hooks/           # Custom hooks
    │   ├── utils/           # Helper functions
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env
```

## 🔐 Authentication & Authorization

### JWT Strategy

- Token issued on login with 1-hour expiry
- Payload: `{ userId, role, baseId, iat, exp }`
- Stored in localStorage on frontend
- Attached to all API requests via Authorization header

### RBAC Roles

| Role                  | Permissions                                              |
| --------------------- | -------------------------------------------------------- |
| **Admin**             | Full access to all features, manage users/bases/assets   |
| **Base Commander**    | Access own base only, assign assets, record expenditures |
| **Logistics Officer** | Create purchases & transfers, limited read access        |

### Base-Level Filtering

- Non-admin users can only access their assigned base data
- Override happens in service layer, never trust frontend baseId

## 💾 Database Design

### Collections

**Users**

- Authentication & role management
- Unique email index
- Password hashed with bcrypt

**Bases**

- Military installation records
- Location information

**Assets**

- Asset master data (vehicles, weapons, etc.)
- Unique serial numbers

**Inventory**

- Base-wise asset tracking
- Opening & current quantities
- Composite index on (baseId, assetId)

**Purchases**

- Purchase records with audit trail
- Auto-updates inventory

**Transfers**

- Inter-base asset transfers
- Prevents negative stock (transaction-based)

**Assignments**

- Personnel asset assignments
- Track who has what

**Expenditures**

- Asset consumption records
- Tracks reason for removal

**AuditLogs**

- Complete action history
- Previous & new state tracking
- IP address logging

## 🔒 Inventory Integrity

### MongoDB Transactions

All inventory-modifying operations use transactions:

```javascript
session.startTransaction();
// Validate stock
// Deduct from source
// Add to destination
// Create record
session.commitTransaction() || session.abortTransaction();
```

Operations protected:

- ✔️ Purchases
- ✔️ Transfers
- ✔️ Assignments
- ✔️ Expenditures
- ✔️ Opening Balance Setup

### Prevent Negative Inventory

- Pre-check quantity before deduction
- Throw error if insufficient stock
- All updates atomic within transaction

## 📊 Dashboard Metrics

Uses MongoDB Aggregation Pipeline:

- Opening Balance (sum)
- Current Balance (sum)
- Transaction counts (purchases, transfers, assignments, expenditures)
- Low-stock alerts (< 10 units)
- Per-asset breakdown

## 📝 Audit Logging

All write operations logged:

```json
{
  "userId": "ObjectId",
  "action": "CREATE_PURCHASE|UPDATE_INVENTORY|et...",
  "entityType": "Purchase|Transfer|AuditLog",
  "entityId": "ObjectId",
  "previousState": { ... },
  "newState": { ... },
  "changes": { ... },
  "timestamp": "ISO-8601",
  "ipAddress": "IP"
}
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js v16+ and npm
- MongoDB v5.0+

### Backend Setup

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Configure Environment**

```bash
# .env file already includes:
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/military-asset-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=1h
```

3. **Seed Database**

```bash
npm run seed
# Creates sample data with users and base inventories
```

4. **Start Server**

```bash
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Install Dependencies**

```bash
cd frontend
npm install
```

2. **Start Development Server**

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

3. **Build for Production**

```bash
npm run build
# Creates optimized build in dist/
```

## 🔑 Demo Credentials

**Admin**

- Email: `admin@military.com`
- Password: `Admin@123`

**Base Commander**

- Email: `commander@military.com`
- Password: `Commander@123`

**Logistics Officer**

- Email: `logistics@military.com`
- Password: `Logistics@123`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get JWT
- `GET /api/auth/me` - Get current user

### Users (Admin only)

- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Bases (Admin only)

- `GET /api/bases` - List all bases
- `POST /api/bases` - Create base
- `PUT /api/bases/:id` - Update base
- `DELETE /api/bases/:id` - Delete base

### Assets (Admin only)

- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Inventory

- `GET /api/inventory/:baseId` - Get inventory
- `PUT /api/inventory/opening-balance` - Set opening balance

### Purchases (Logistics Officer)

- `POST /api/inventory/purchases` - Record purchase
- `GET /api/inventory/purchases` - List purchases

### Transfers (Logistics Officer)

- `POST /api/inventory/transfers` - Record transfer
- `GET /api/inventory/transfers` - List transfers

### Assignments (Base Commander)

- `POST /api/inventory/assignments` - Assign asset
- `GET /api/inventory/assignments` - List assignments

### Expenditures (Base Commander)

- `POST /api/inventory/expenditures` - Record expenditure
- `GET /api/inventory/expenditures` - List expenditures

### Dashboard

- `GET /api/dashboard/:baseId` - Get dashboard metrics

### Audit (Admin only)

- `GET /api/audit-logs` - Get audit logs

## 🛡️ Security Features

✅ **Password Hashing**: bcrypt with salt rounds
✅ **JWT Authentication**: Token-based with expiry
✅ **RBAC Middleware**: Role-based access control
✅ **Input Validation**: Express-validator on all routes
✅ **Security Headers**: Helmet.js enabled
✅ **CORS**: Restricted to frontend domain
✅ **Error Handling**: No stack traces in production
✅ **Audit Logging**: Complete operation history
✅ **Transaction Safety**: MongoDB transactions for inventory

## 📈 Scalability Considerations

- ✅ Indexes on frequently queried fields (baseId, assetId, createdAt)
- ✅ Aggregation pipeline for complex dashboard queries
- ✅ Service layer abstracts business logic
- ✅ Modular route structure for easy expansion
- ✅ Session-based transactions for consistency

## 🧪 Testing the System

1. **Login** with any demo credential
2. **View Dashboard** - See opening balance, current balance, transactions
3. **Record Purchase** - Add inventory
4. **Transfer Asset** - Move between bases (confirms stock check)
5. **Assign Asset** - Assign to personnel
6. **Record Expenditure** - Remove from inventory
7. **View Audit Logs** - See all operations (Admin only)

## 📦 Deployment

### Backend (Render)

1. Create Render account
2. Connect GitHub repository
3. Set environment variables
4. Deploy Node.js service
5. Add MongoDB Atlas connection

### Frontend (Vercel)

1. Create Vercel account
2. Connect GitHub repository
3. Set `VITE_API_URL` environment variable
4. Deploy

## 🏁 Production Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Update MONGO_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Enable CORS for production domain
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Enable HTTPS
- [ ] Backup MongoDB regularly

## 📄 License

This project is proprietary military infrastructure software.

## 👥 Team

Built as a full-stack web application project demonstrating:

- Full-stack architecture patterns
- Security best practices
- Database transaction management
- Role-based access control
- Audit logging implementation
- Production-ready code standards
