function authenticateSession(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  req.user = req.session.user; // { id, name, email, role }
  next();
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
