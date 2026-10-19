const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type && payload.type !== 'access') {
      return res.status(401).json({ detail: 'Invalid token type.' });
    }
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token.' });
  }
}

module.exports = { authenticate };
