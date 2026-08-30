const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'quotation_app_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  // Support mock token for local testing and default auto-login session
  if (token.startsWith('mock_jwt_token_')) {
    const mobile = token.replace('mock_jwt_token_', '');
    req.user = {
      id: mobile === '7768807208' ? 'usr_7768807208' : (mobile === '9225087140' ? 'usr_1786187974730' : 'usr_' + mobile),
      role: 'customer',
      mobile: mobile,
      name: 'Gouri Aqua Plast Customer'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
