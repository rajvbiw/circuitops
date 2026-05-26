const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Register User
async function register(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password.' });
  }

  try {
    // Check if user exists
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'customer']
    );

    const userId = result.insertId;

    // Create session
    req.session.user = {
      id: userId,
      name,
      email,
      role: 'customer'
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
}

// Login User
async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    // Check user in DB
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check if password_hash exists (Google logged-in users might not have one)
    if (!user.password_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account uses Google Sign-In. Please click the Google login button.' 
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
}

// Google Login / OAuth Callback Endpoint
async function googleLogin(req, res, next) {
  const { googleId, name, email } = req.body;

  if (!googleId || !email || !name) {
    return res.status(400).json({ success: false, message: 'Google authentication details missing.' });
  }

  try {
    // 1. Check if user already exists with this googleId
    let users = await db.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    let user;

    if (users.length > 0) {
      user = users[0];
    } else {
      // 2. Check if user exists with this email but no googleId (link them)
      const usersByEmail = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (usersByEmail.length > 0) {
        user = usersByEmail[0];
        await db.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
        user.google_id = googleId;
      } else {
        // 3. Create a new user
        const result = await db.query(
          'INSERT INTO users (name, email, google_id, role) VALUES (?, ?, ?, ?)',
          [name, email, googleId, 'customer']
        );
        const insertId = result.insertId;
        user = { id: insertId, name, email, google_id: googleId, role: 'customer' };
      }
    }

    // 4. Generate session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: 'Google login successful!',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
}

// Get User Profile
async function getProfile(req, res, next) {
  try {
    const users = await db.query('SELECT id, name, email, role, google_id, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    next(error);
  }
}

// Logout User
async function logout(req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return next(err);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
  } else {
    return res.status(200).json({ success: true, message: 'No active session.' });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  logout
};
