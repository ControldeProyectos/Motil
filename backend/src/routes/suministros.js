const express = require('express');
const { db } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/suministros
router.get('/', authenticateToken, (req, res) => {
  const { estado, alerta, categoria } = req.query;
  let query = 'SELECT * FROM suministros WHERE 1=1';
  const params = [];
  if (estado) { query += ' AND estado = ?'; params.push(estado); }
  if (alerta !== undefined) { query += ' AND alerta = ?'; params.push(parseInt(alerta)); }
  if (categoria) { query += ' AND categoria = ?'; params.push(categoria); }
  query += ' ORDER BY alerta DESC, fecha_requerida';
  const items = db.prepare(query).all(...params);
  res.json(items);
});

// GET /api/suministros/:id
router.get('/:id', authenticateToken, (req, res) => {
  const item = db.prepare('SELECT * FROM suministros WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Suministro no encontrado' });
  res.json(item);
});

// POST /api/suministros
router.post('/', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const {
    codigo, descripcion, categoria, unidad,
    cantidad_requerida, cantidad_disponible, fecha_requerida, fecha_entrega,
    proveedor, estado, observaciones
  } = req.body;
  if (!descripcion) return res.status(400).json({ error: 'Descripción requerida' });

  const alerta = (cantidad_disponible || 0) < (cantidad_requerida || 0) ? 1 : 0;

  const result = db.prepare(`
    INSERT INTO suministros
    (codigo, descripcion, categoria, unidad, cantidad_requerida, cantidad_disponible,
     fecha_requerida, fecha_entrega, proveedor, estado, alerta, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    codigo || null, descripcion, categoria || null, unidad || 'und',
    cantidad_requerida || 0, cantidad_disponible || 0,
    fecha_requerida || null, fecha_entrega || null,
    proveedor || null, estado || 'pendiente', alerta, observaciones || null
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/suministros/:id
router.put('/:id', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const {
    codigo, descripcion, categoria, unidad,
    cantidad_requerida, cantidad_disponible, fecha_requerida, fecha_entrega,
    proveedor, estado, observaciones
  } = req.body;

  const alerta = (cantidad_disponible || 0) < (cantidad_requerida || 0) ? 1 : 0;

  db.prepare(`
    UPDATE suministros SET
    codigo=?, descripcion=?, categoria=?, unidad=?,
    cantidad_requerida=?, cantidad_disponible=?, fecha_requerida=?, fecha_entrega=?,
    proveedor=?, estado=?, alerta=?, observaciones=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    codigo, descripcion, categoria, unidad,
    cantidad_requerida, cantidad_disponible, fecha_requerida, fecha_entrega,
    proveedor, estado, alerta, observaciones, req.params.id
  );
  res.json({ success: true });
});

// DELETE /api/suministros/:id
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM suministros WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
