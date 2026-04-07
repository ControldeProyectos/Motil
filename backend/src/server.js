const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/proyecto', require('./routes/proyecto'));
app.use('/api/avances', require('./routes/avances'));
app.use('/api/restricciones', require('./routes/restricciones'));
app.use('/api/suministros', require('./routes/suministros'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Initialize DB first, then start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MOTIL Backend running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
