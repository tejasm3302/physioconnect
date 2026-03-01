import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.role || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

export function requireSelfOrAdmin(paramKey = 'userId') {
  return (req, res, next) => {
    if (req.auth?.role === 'admin') {
      return next();
    }

    if (req.auth?.sub !== req.params[paramKey]) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}

export function requireRoleSelfOrAdmin(paramKey, selfRole) {
  return (req, res, next) => {
    if (req.auth?.role === 'admin') {
      return next();
    }

    if (req.auth?.role !== selfRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.auth?.sub !== req.params[paramKey]) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}