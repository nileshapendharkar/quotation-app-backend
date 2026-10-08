let app;
try {
  app = require('../server');
} catch (err) {
  console.error('CRITICAL: Failed to load server.js:', err);
}

module.exports = (req, res) => {
  if (!app) {
    return res.status(500).json({ error: 'Server initialization failed' });
  }
  return app(req, res);
};
