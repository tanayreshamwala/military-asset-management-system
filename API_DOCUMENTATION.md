# API Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.military-asset.com/api`

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE"
}
```

---

## Endpoints

### Authentication

#### Register

```
POST /auth/register
```

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@military.com",
  "password": "SecurePassword123",
  "role": "base_commander",
  "baseId": "ObjectId"
}
```

**Response:**

```json
{
  "success": true,
  "user": { "_id", "name", "email", "role", "baseId" }
}
```

#### Login

```
POST /auth/login
```

**Request:**

```json
{
  "email": "admin@military.com",
  "password": "Admin@123"
}
```

**Response:**

```json
{
  "success": true,
  "user": { "_id", "name", "email", "role", "baseId" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User

```
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "user": { "full user object" }
}
```

---

### Users (Admin Only)

#### Get All Users

```
GET /users?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "users": [ { user objects } ],
  "pagination": { "total": 20, "page": 1, "limit": 10, "pages": 2 }
}
```

#### Create User

```
POST /users
Authorization: Bearer <admin_token>
```

**Request:**

```json
{
  "name": "New User",
  "email": "newuser@military.com",
  "password": "Password123",
  "role": "logistics_officer",
  "baseId": "ObjectId"
}
```

#### Update User

```
PUT /users/:id
Authorization: Bearer <admin_token>
```

**Request Body:** Same fields as create (password optional)

#### Delete User

```
DELETE /users/:id
Authorization: Bearer <admin_token>
```

---

### Bases (Admin Only)

#### Get All Bases

```
GET /bases?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Base

```
POST /bases
Authorization: Bearer <admin_token>
```

**Request:**

```json
{
  "name": "Fort Lewis",
  "location": "Washington State"
}
```

#### Update Base

```
PUT /bases/:id
Authorization: Bearer <admin_token>
```

#### Delete Base

```
DELETE /bases/:id
Authorization: Bearer <admin_token>
```

---

### Assets (Admin Only)

#### Get All Assets

```
GET /assets?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Asset

```
POST /assets
Authorization: Bearer <admin_token>
```

**Request:**

```json
{
  "name": "M1 Abrams Tank",
  "type": "Vehicle",
  "serialNumber": "ABR-001"
}
```

**Asset Types:** `Vehicle`, `Weapon`, `Ammunition`, `Equipment`

#### Update Asset

```
PUT /assets/:id
Authorization: Bearer <admin_token>
```

#### Delete Asset

```
DELETE /assets/:id
Authorization: Bearer <admin_token>
```

---

### Inventory

#### Get Inventory

```
GET /inventory/:baseId
Authorization: Bearer <token>
```

**Returns:** All assets in base with opening balance, current quantity

#### Set Opening Balance

```
PUT /inventory/opening-balance
Authorization: Bearer <admin_token>
```

**Request:**

```json
{
  "baseId": "ObjectId",
  "assetId": "ObjectId",
  "openingBalance": 100
}
```

---

### Purchases (Logistics Officer)

#### Record Purchase

```
POST /inventory/purchases
Authorization: Bearer <token>
```

**Request:**

```json
{
  "baseId": "ObjectId",
  "assetId": "ObjectId",
  "quantity": 50
}
```

**Effects:**

- Increases inventory quantity
- Creates purchase record
- Logs audit entry

#### Get Purchases

```
GET /inventory/purchases?baseId=ObjectId&page=1&limit=10
Authorization: Bearer <token>
```

---

### Transfers (Logistics Officer)

#### Record Transfer

```
POST /inventory/transfers
Authorization: Bearer <token>
```

**Request:**

```json
{
  "fromBaseId": "ObjectId",
  "toBaseId": "ObjectId",
  "assetId": "ObjectId",
  "quantity": 25
}
```

**Effects:**

- Validates source has adequate quantity
- Deducts from source base
- Adds to destination base
- All in transaction
- Creates transfer record

#### Get Transfers

```
GET /inventory/transfers?baseId=ObjectId&page=1&limit=10
Authorization: Bearer <token>
```

---

### Assignments (Base Commander)

#### Assign Asset

```
POST /inventory/assignments
Authorization: Bearer <token>
```

**Request:**

```json
{
  "baseId": "ObjectId",
  "assetId": "ObjectId",
  "personnelName": "Sergeant Smith",
  "personnelId": "PS-001",
  "quantity": 10
}
```

**Effects:**

- Validates sufficient inventory
- Deducts from base inventory
- Creates assignment record
- Logs audit entry

#### Get Assignments

```
GET /inventory/assignments?baseId=ObjectId&page=1&limit=10
Authorization: Bearer <token>
```

---

### Expenditures (Base Commander)

#### Record Expenditure

```
POST /inventory/expenditures
Authorization: Bearer <token>
```

**Request:**

```json
{
  "baseId": "ObjectId",
  "assetId": "ObjectId",
  "quantity": 100,
  "reason": "Combat operations - Operation Desert Storm"
}
```

**Effects:**

- Validates sufficient inventory
- Deducts from inventory
- Creates expenditure record
- Logs audit entry

#### Get Expenditures

```
GET /inventory/expenditures?baseId=ObjectId&page=1&limit=10
Authorization: Bearer <token>
```

---

### Dashboard

#### Get Dashboard Metrics

```
GET /dashboard/:baseId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "metrics": {
    "totals": {
      "totalOpening": 1000,
      "totalCurrent": 850
    },
    "inventory": [
      {
        "_id": "assetId",
        "assetName": "M16 Rifle",
        "assetType": "Weapon",
        "openingBalance": 500,
        "currentQuantity": 450
      }
    ],
    "transactionCounts": {
      "purchases": 25,
      "transfers": 12,
      "assignments": 45,
      "expenditures": 5
    },
    "lowStockAlert": [
      {
        "assetId": { "name": "Helmet", "type": "Equipment" },
        "currentQuantity": 8
      }
    ]
  }
}
```

---

### Audit Logs (Admin Only)

#### Get Audit Logs

```
GET /audit-logs?userId=ObjectId&entityType=Purchase&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "logs": [
    {
      "_id": "logId",
      "userId": { "name": "Admin User", "email": "admin@military.com" },
      "action": "CREATE_PURCHASE",
      "entityType": "Purchase",
      "entityId": "purchaseId",
      "changes": { "quantity": 50, "baseId": "..." },
      "timestamp": "2024-01-15T10:30:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "pagination": { "total": 150, "page": 1, "limit": 50, "pages": 3 }
}
```

---

## Error Codes

| Code | Status         | Meaning                                 |
| ---- | -------------- | --------------------------------------- |
| 400  | Bad Request    | Invalid input or insufficient inventory |
| 401  | Unauthorized   | Missing or invalid token                |
| 403  | Forbidden      | Insufficient permissions for action     |
| 404  | Not Found      | Resource not found                      |
| 500  | Internal Error | Server error                            |

## Rate Limiting

Current implementation has no rate limiting. For production, add:

- 100 requests per minute per IP
- 50 requests per minute per authenticated user

## Pagination

All list endpoints support:

- `page` (default: 1)
- `limit` (default: 10, max: 100)

Responses include pagination object:

```json
{
  "pagination": {
    "total": 250,
    "page": 2,
    "limit": 10,
    "pages": 25
  }
}
```
