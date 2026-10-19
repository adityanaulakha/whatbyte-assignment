const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function signTokens(user) {
  const access = jwt.sign(
    { userId: user.id, email: user.email, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refresh = jwt.sign(
    { userId: user.id, email: user.email, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { access, refresh };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ detail: 'A user with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name.trim(), email.toLowerCase(), passwordHash]
  );

  const user = result.rows[0];
  const tokens = signTokens(user);

  return res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
    ...tokens,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }

  const tokens = signTokens(user);

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
    ...tokens,
  });
}

module.exports = { register, login };
