# API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication Endpoint

### Login
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin2024secure"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "username": "admin",
  "alchemyKey": null
}
```

**Response (User):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user",
  "username": "john_doe",
  "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/YOUR_KEY"
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing username/password
- `401` - Invalid credentials

---

## User Endpoints

### Get Current User Info
**Endpoint:** `GET /api/user/me`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "username": "john_doe",
  "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/YOUR_KEY",
  "role": "user"
}
```

**Status Codes:**
- `200` - Success
- `401` - No token / Invalid token
- `500` - User not found

---

## Admin Endpoints

### Create New User
**Endpoint:** `POST /api/admin/users`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "username": "new_user",
  "password": "secure_password_123",
  "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/YOUR_KEY"
}
```

**Response (Success):**
```json
{
  "message": "User created successfully",
  "userId": 5
}
```

**Response (Error):**
```json
{
  "error": "Username already exists"
}
```

**Status Codes:**
- `201` - User created
- `400` - Missing fields
- `403` - Admin access required
- `500` - Database error

---

### Get All Users
**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
```json
[
  {
    "id": 2,
    "username": "demo",
    "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/demo",
    "createdAt": "2024-01-15 10:30:00"
  },
  {
    "id": 3,
    "username": "john_doe",
    "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/CUSTOM_KEY",
    "createdAt": "2024-01-16 14:22:00"
  }
]
```

**Status Codes:**
- `200` - Success
- `403` - Admin access required
- `500` - Database error

---

### Delete User
**Endpoint:** `DELETE /api/admin/users/:username`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Example:**
```
DELETE /api/admin/users/john_doe
```

**Response:**
```json
{
  "message": "User deleted"
}
```

**Status Codes:**
- `200` - User deleted
- `403` - Admin access required
- `500` - Database error

---

### Update User RPC Key
**Endpoint:** `PUT /api/admin/users/:username/rpc`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "alchemyKey": "https://robinhood-mainnet.g.alchemy.com/v2/NEW_KEY"
}
```

**Response:**
```json
{
  "message": "RPC key updated"
}
```

**Status Codes:**
- `200` - Key updated
- `400` - Missing alchemyKey
- `403` - Admin access required
- `500` - Database error

---

### Get Login Logs
**Endpoint:** `GET /api/admin/logs`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
```json
[
  {
    "username": "demo",
    "loginTime": "2024-01-20 15:30:45",
    "status": "success"
  },
  {
    "username": "admin",
    "loginTime": "2024-01-20 15:28:12",
    "status": "success"
  },
  {
    "username": "john_doe",
    "loginTime": "2024-01-20 15:00:00",
    "status": "failed"
  }
]
```

**Limit:** Last 100 entries

**Status Codes:**
- `200` - Success
- `403` - Admin access required
- `500` - Database error

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

**Missing Authorization:**
```json
{
  "error": "No token provided"
}
```

**Invalid Token:**
```json
{
  "error": "Invalid token"
}
```

**Insufficient Permissions:**
```json
{
  "error": "Admin access required"
}
```

**Database Error:**
```json
{
  "error": "Database error"
}
```

---

## JWT Token Structure

Tokens are valid for **24 hours** and include:
```json
{
  "userId": 1,
  "username": "admin",
  "role": "admin"
}
```

**Token Usage:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/me
```

---

## Rate Limiting (Optional)

Recommended for production:
- Login endpoint: 5 attempts per 15 minutes per IP
- Admin endpoints: 10 requests per minute per admin user

---

## Example Workflow (JavaScript/Fetch)

```javascript
// Step 1: Login
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin2024secure' })
});
const { token, role } = await loginRes.json();

// Step 2: Create User (Admin)
const createRes = await fetch('http://localhost:3000/api/admin/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    username: 'new_user',
    password: 'secure_password',
    alchemyKey: 'https://...'
  })
});
const created = await createRes.json();
console.log(created); // { message: "User created successfully", userId: 5 }

// Step 3: Get Users (Admin)
const usersRes = await fetch('http://localhost:3000/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const users = await usersRes.json();
console.log(users);
```

---

## Testing with cURL

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin2024secure"}'

# Get users (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/admin/users

# Create user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass","alchemyKey":"https://..."}'

# Get logs
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/admin/logs

# Delete user
curl -X DELETE http://localhost:3000/api/admin/users/test \
  -H "Authorization: Bearer TOKEN"
```

---

## Version
- API Version: 1.0.0
- Ethers.js: 5.7.2
- Express: 4.18.2
- Node.js: 14+
