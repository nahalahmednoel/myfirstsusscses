# DEPLOYMENT CHECKLIST

## Pre-Deployment (Local Testing)
- [ ] Clone/download all files
- [ ] Run `npm install` successfully
- [ ] Both `start.sh` (macOS/Linux) and `start.bat` (Windows) created
- [ ] Test login with `admin / admin2024secure`
- [ ] Test demo user `demo / demo123`
- [ ] Verify admin panel opens (hidden route)
- [ ] Test creating a new user via admin panel
- [ ] Test all 4 dashboard features (Mint, Wallet, Distribute, NFT)
- [ ] Verify terminal logs display correctly
- [ ] Check responsive design on mobile

## Production Deployment Steps

### 1. Environment Setup
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Generate new `JWT_SECRET` (minimum 32 random characters)
  ```bash
  # On Linux/macOS:
  openssl rand -base64 32
  # On Windows (PowerShell):
  [Convert]::ToBase64String([System.Text.Encoding]::UTF32.GetBytes(([guid]::NewGuid()).ToString())) | Select-Object -First 1
  ```
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your domain
- [ ] Review and update all sensitive values

### 2. Security Hardening
- [ ] Change default admin password in `.env`
- [ ] Remove demo user account (optional)
- [ ] Enable HTTPS only (use reverse proxy like Nginx)
- [ ] Implement rate limiting on `/api/auth/login`
  ```javascript
  // Add to server.js if needed:
  const rateLimit = require('express-rate-limit');
  const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5
  });
  app.post('/api/auth/login', loginLimiter, ...);
  ```
- [ ] Add request size limits
- [ ] Enable helmet.js for security headers
  ```bash
  npm install helmet
  ```
- [ ] Set up database backups (if using persistent DB)

### 3. Database Migration (Optional - For Persistence)
Replace in-memory DB with SQLite file:
```javascript
// In server.js, line ~15:
const db = new sqlite3.Database('./db/mochishood.db', (err) => {
```
Create `db/` directory first:
```bash
mkdir db
chmod 700 db
```

### 4. Server Deployment

#### Option A: Heroku
```bash
npm install -g heroku-cli
heroku login
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET="your-secret-key"
heroku open
```

#### Option B: DigitalOcean
```bash
# SSH into droplet
ssh root@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd mochishood-web3
npm install

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name mochishood
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure /etc/nginx/sites-available/default to proxy to localhost:3000
```

#### Option C: AWS EC2
- Launch Ubuntu 22.04 LTS instance
- Security group: Allow ports 80, 443, 22
- SSH in and follow DigitalOcean steps above
- Use AWS Certificate Manager for SSL/TLS

#### Option D: Render
- Connect GitHub repo
- Set environment variables in Render dashboard
- Deploy with one click
- Automatic HTTPS

### 5. SSL/TLS Certificate
- [ ] Install Let's Encrypt SSL (Certbot)
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot certonly --nginx -d yourdomain.com
  ```
- [ ] Auto-renewal configured
- [ ] Force HTTPS redirect

### 6. Monitoring & Logs
- [ ] Set up application logging (Winston/Morgan)
- [ ] Monitor server health and uptime
- [ ] Configure error alerts
- [ ] Log rotation for large deployments

### 7. DNS & Domain
- [ ] Update DNS A record to server IP
- [ ] Wait for propagation (up to 48 hours)
- [ ] Test domain accessibility

### 8. Final Testing (Production)
- [ ] Access via HTTPS only
- [ ] Admin login works
- [ ] User login works
- [ ] RPC injection verified
- [ ] All API endpoints functional
- [ ] Error handling works
- [ ] No console errors in browser

### 9. Maintenance Plan
- [ ] Weekly log reviews
- [ ] Monthly security patches
- [ ] Database backups scheduled
- [ ] Uptime monitoring active
- [ ] Update dependencies monthly: `npm update`

---

## Scaling Considerations

### For High Traffic
- [ ] Switch to PostgreSQL or MySQL (more reliable than SQLite)
- [ ] Implement Redis caching for login sessions
- [ ] Load balance with multiple server instances
- [ ] Use CDN for static assets
- [ ] Implement database connection pooling

### Security at Scale
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection
- [ ] API key rotation
- [ ] Audit logging to external service
- [ ] Penetration testing

---

## Rollback Procedure
If deployment fails:
```bash
# Revert to previous version
git revert HEAD
npm install
npm start

# Or restore from backup
pm2 stop mochishood
cp backup/server.js ./server.js
npm install
pm2 start server.js
```

---

## Support & Debugging

### Common Issues

**Port 3000 in use:**
```bash
# Find process
lsof -i :3000
kill -9 <PID>
```

**Database locked:**
```bash
# Clear and reinitialize
rm db/mochishood.db
npm start
```

**JWT errors:**
```javascript
// Ensure JWT_SECRET is set in .env
// Check token expiration: 24 hours
```

**CORS errors:**
Update `CORS_ORIGIN` in `.env` to match frontend domain

---

**Questions?** Review server logs: `pm2 logs mochishood`
