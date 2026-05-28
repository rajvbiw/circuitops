const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'circuitops_jwt_secret_2026';

function authenticateSession(req, res, next) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    } catch (error) {
      console.warn('JWT validation failed, falling back to session auth:', error.message);
      // If the bearer token is invalid or expired, allow valid session auth to still work
    }
  }

  if (req.session && req.session.user) {
    req.user = req.session.user; // { id, name, email, role }
    return next();
  }

  return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }

    next();
  };
}

module.exports = {
  authenticateSession,
  authenticateJWT: authenticateSession, // Alias for backward compatibility
  authorizeRoles
};
