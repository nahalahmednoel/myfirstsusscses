# MOCHiHOOD Web3 Full-Stack Dashboard
## Complete Setup & Deployment Guide

---

## 🚀 QUICK START

### Prerequisites
- Node.js 14+ installed
- npm package manager
- A code editor (VS Code recommended)

### Installation Steps

1. **Clone/Create Project Directory**
   ```bash
   mkdir mochishood-web3
   cd mochishood-web3
   ```

2. **Copy Files**
   - Place `server.js` in the root directory
   - Create a `public/` folder and place `index.html` inside
   - Copy `package.json` to the root

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`

---

## 🔐 DEFAULT CREDENTIALS

### Admin Login
- **Username:** `admin`
- **Password:** `admin2024secure`

### Demo User (for testing)
- **Username:** `demo`
- **Password:** `demo123`
- **RPC:** https://robinhood-mainnet.g.alchemy.com/v2/demo

---

## 📋 FEATURES & WORKFLOW

### 1. **Single Login Page** (Textless & Simple)
   - No sign-up option visible
   - Backend determines role automatically
   - Clean, minimalist design with 3D cartoon theme

### 2. **User Dashboard** (Icon-Driven, Textless)
   - 4 Main Features (accessed via emojis/icons):
     - ⚡ Flash Mint
     - 👛 Wallet Generator
     - 💸 Fee Distribution
     - 🖼️ NFT Transfer
   - Dynamic RPC injection per user
   - All core Ethers.js logic preserved

### 3. **Hidden Admin Panel** (Accessible by specific credentials)
   - **Create Users:** Assign username, password, custom RPC key
   - **Manage Users:** View and delete user accounts
   - **View Logs:** Track login activity with timestamps

---

## ⚙️ BACKEND ARCHITECTURE

### Express.js Server (`server.js`)
- **Port:** 3000
- **Database:** SQLite (in-memory)
- **Authentication:** JWT (24-hour tokens)
- **Security:** bcrypt password hashing

### API Endpoints

#### Public
- `POST /api/auth/login` - User/Admin login

#### Protected (User)
- `GET /api/user/me` - Get current user info + RPC key

#### Protected (Admin Only)
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:username` - Delete user
- `PUT /api/admin/users/:username/rpc` - Update user RPC key
- `GET /api/admin/logs` - View login activity logs

---

## 🎨 FRONTEND FEATURES

### UI Theme
- **3D Cartoon Animation** with floating orbs
- **Color Palette:** Cyan, Magenta, Yellow, Lime, Purple
- **Animations:** Pulse, float, slide, glow effects
- **Responsive Design:** Mobile-friendly

### Textless Dashboard
- Uses **FontAwesome icons** + **Emojis**
- **No English or Bengali text** in user interface
- Only universal Web3 symbols (ETH, NFT, RPC, Tx, 0x)
- Admin panel (hidden) allows text for management

---

## 🔒 SECURITY CONSIDERATIONS

### Password Storage
- Passwords hashed with bcrypt (salt rounds: 10)
- Never stored in plain text

### JWT Tokens
- Expire after 24 hours
- Signed with secret key (change `JWT_SECRET` in production)
- Sent via Authorization header

### Admin Access
- NO visual hints on login page
- Only backend verifies admin role
- Seamless redirect to hidden admin UI

### RPC Key Security
- Stored in database, tied to user
- Sent to frontend ONLY after successful login
- Injected dynamically into ethers.js provider

---

## 📱 CORE WEB3 FUNCTIONS (PRESERVED)

### 1. Flash Mint
- Multi-wallet minting support
- GTD/FCFS/Public phase selection
- Gas price customization
- Scheduled or immediate execution
- SeaDrop contract integration

### 2. Wallet Generator
- Batch wallet creation (up to 1000)
- CSV export for easy backup
- Uses ethers.js random generation

### 3. Fee Distribution
- **Mode 1:** Send ETH from one to many wallets
- **Mode 2:** Consolidate ETH from many to one (with max gas calculation)
- Real-time balance checking

### 4. NFT Transfer
- Scan wallets for specific token IDs
- Range support (e.g., 1-50)
- Individual selection checkboxes
- Batch transfer execution

---

## 🛠️ CUSTOMIZATION

### Change Admin Credentials
Edit `server.js`, line ~56:
```javascript
const adminPassword = bcrypt.hashSync('YOUR_NEW_PASSWORD', 10);
```

### Change RPC Chain
Update `SEADROP_CONTRACT` in `public/index.html`:
```javascript
const SEADROP_CONTRACT = "YOUR_CONTRACT_ADDRESS";
```

### Database Persistence (Optional)
Replace `:memory:` with a file path in `server.js`:
```javascript
const db = new sqlite3.Database('./db/mochishood.db', (err) => { ... });
```

---

## 📦 PRODUCTION DEPLOYMENT

### Environment Variables (Add .env file)
```
PORT=3000
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Recommended Hosting
- **Heroku** (with SQLite alternative or external DB)
- **AWS EC2** (full control)
- **DigitalOcean** (droplet with Node.js)
- **Render** (easy deployment)

### Security Checklist
- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS only
- [ ] Set CORS to your domain only
- [ ] Implement rate limiting on auth endpoints
- [ ] Regular database backups
- [ ] Monitor login logs for suspicious activity

---

## 🐛 TROUBLESHOOTING

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
# On macOS/Linux:
lsof -i :3000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS Errors
Make sure the frontend is served from the same origin, or update CORS settings in `server.js`

### Database Errors
Ensure you have write permissions in the project directory

### JWT Token Expired
Tokens expire after 24 hours. Users must log in again

---

## 📞 SUPPORT

For issues or custom modifications, review:
1. Server logs (check terminal output)
2. Browser console (F12 > Console)
3. Network tab (F12 > Network) to inspect API calls

---

## 📄 PROJECT STRUCTURE
```
mochishood-web3/
├── server.js              # Express.js backend with auth & admin APIs
├── package.json           # Node.js dependencies
├── public/
│   └── index.html         # Full-stack frontend (login + dashboard + admin panel)
└── README.md              # This file
```

---

**Developed by NAHAL AHMED NOEL**
**Last Updated:** 2024
