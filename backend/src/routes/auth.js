const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/schema');
const { JWT_SECRET, authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND activo = 1').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol }
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/users  (admin only)
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.prepare('SELECT id, username, nombre, rol, activo, created_at FROM users').all();
  res.json(users);
});

// POST /api/auth/users  (admin only)
router.post('/users', authenticateToken, requireRole('admin'), (req, res) => {
  const { username, password, nombre, rol } = req.body;
  if (!username || !password || !nombre) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare(
      'INSERT INTO users (username, password, nombre, rol) VALUES (?, ?, ?, ?)'
    ).run(username, hashed, nombre, rol || 'viewer');
    res.status(201).json({ id: result.lastInsertRowid, username, nombre, rol: rol || 'viewer' });
  } catch (e) {
    res.status(400).json({ error: 'El usuario ya existe' });
  }
});

// PUT /api/auth/users/:id (admin only)
router.put('/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { nombre, rol, activo, password } = req.body;
  const { id } = req.params;
  if (password) {
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET nombre=?, rol=?, activo=?, password=? WHERE id=?')
      .run(nombre, rol, activo, hashed, id);
  } else {
    db.prepare('UPDATE users SET nombre=?, rol=?, activo=? WHERE id=?')
      .run(nombre, rol, activo, id);
  }
  res.json({ success: true });
});

module.exports = router;
