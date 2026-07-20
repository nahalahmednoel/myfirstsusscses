const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production-12345';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Database Setup
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) console.error('Database Error:', err);
    else console.log('SQLite In-Memory Database initialized');
});

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        alchemyKey TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Login logs table
    db.run(`CREATE TABLE IF NOT EXISTS loginLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        ipAddress TEXT
    )`);

    // Insert default admin and demo users
    const adminPassword = bcrypt.hashSync('admin2024secure', 10);
    const demoPassword = bcrypt.hashSync('demo123', 10);

    db.run(`INSERT OR IGNORE INTO users (username, password, alchemyKey, role) 
            VALUES (?, ?, ?, ?)`,
        ['admin', adminPassword, 'N/A', 'admin'],
        (err) => {
            if (!err) console.log('✓ Admin user created (username: admin, password: admin2024secure)');
        }
    );

    db.run(`INSERT OR IGNORE INTO users (username, password, alchemyKey, role) 
            VALUES (?, ?, ?, ?)`,
        ['demo', demoPassword, 'https://robinhood-mainnet.g.alchemy.com/v2/demo', 'user'],
        (err) => {
            if (!err) console.log('✓ Demo user created (username: demo, password: demo123)');
        }
    );
});

// ============ AUTH ENDPOINTS ============

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            // Log failed attempt
            db.run('INSERT INTO loginLogs (username, status) VALUES (?, ?)', [username, 'failed']);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Log successful login
        db.run('INSERT INTO loginLogs (username, status) VALUES (?, ?)', [username, 'success']);

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            role: user.role,
            username: user.username,
            alchemyKey: user.role === 'user' ? user.alchemyKey : null
        });
    });
});

// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ============ ADMIN ENDPOINTS ============

// Create new user (Admin only)
app.post('/api/admin/users', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, alchemyKey } = req.body;

    if (!username || !password || !alchemyKey) {
        return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        'INSERT INTO users (username, password, alchemyKey, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, alchemyKey, 'user'],
        function(err) {
            if (err) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            res.json({ message: 'User created successfully', userId: this.lastID });
        }
    );
});

// Get all users (Admin only)
app.get('/api/admin/users', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.all('SELECT id, username, alchemyKey, createdAt FROM users WHERE role = ?', ['user'], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

// Delete user (Admin only)
app.delete('/api/admin/users/:username', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.run('DELETE FROM users WHERE username = ? AND role = ?', [req.params.username, 'user'], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User deleted' });
    });
});

// Get login logs (Admin only)
app.get('/api/admin/logs', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.all('SELECT username, loginTime, status FROM loginLogs ORDER BY loginTime DESC LIMIT 100', (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(logs);
    });
});

// Update user RPC key (Admin only)
app.put('/api/admin/users/:username/rpc', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { alchemyKey } = req.body;
    if (!alchemyKey) {
        return res.status(400).json({ error: 'Alchemy key required' });
    }

    db.run('UPDATE users SET alchemyKey = ? WHERE username = ?', [alchemyKey, req.params.username], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'RPC key updated' });
    });
});

// Get current user info
app.get('/api/user/me', verifyToken, (req, res) => {
    db.get('SELECT username, alchemyKey, role FROM users WHERE username = ?', [req.user.username], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 MOCHiHOOD Web3 Server running on http://localhost:${PORT}`);
    console.log(`📝 Default Admin Credentials:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin2024secure\n`);
});
