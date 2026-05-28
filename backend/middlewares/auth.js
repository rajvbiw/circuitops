const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'circuitops_jwt_secret_2026';

function authenticateSession(req, res, next) {
  try {
    const authHeader = req.headers?.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    }

    if (req.session && req.session.user) {
      req.user = req.session.user; // { id, name, email, role }
      return next();
    }

    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
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
