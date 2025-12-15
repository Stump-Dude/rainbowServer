const jwt = require('jsonwebtoken');

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required env var: JWT_SECRET');
  }
  return secret;
}

function signToken(payload) {
  const secret = requireJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  const scheme = parts[0];
  const token = parts[1];

  if (scheme !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid auth scheme' });
  }

  const secret = requireJwtSecret();

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { signToken, authMiddleware };
