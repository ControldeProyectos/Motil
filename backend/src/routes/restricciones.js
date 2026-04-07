const express = require('express');
const { db } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/restricciones
router.get('/', authenticateToken, (req, res) => {
  const { estado, tipo, prioridad } = req.query;
  let query = `
    SELECT r.*, f.nombre as frente_nombre
    FROM restricciones r
    LEFT JOIN frentes f ON r.frente_id = f.id
    WHERE 1=1
  `;
  const params = [];
  if (estado) { query += ' AND r.estado = ?'; params.push(estado); }
  if (tipo) { query += ' AND r.tipo = ?'; params.push(tipo); }
  if (prioridad) { query += ' AND r.prioridad = ?'; params.push(prioridad); }
  query += ' ORDER BY r.prioridad DESC, r.fecha_identificacion DESC';
  const restricciones = db.prepare(query).all(...params);
  res.json(restricciones);
});

// GET /api/restricciones/:id
router.get('/:id', authenticateToken, (req, res) => {
  const r = db.prepare(`
    SELECT r.*, f.nombre as frente_nombre
    FROM restricciones r LEFT JOIN frentes f ON r.frente_id = f.id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Restricción no encontrada' });
  res.json(r);
});

// POST /api/restricciones
router.post('/', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const {
    codigo, descripcion, tipo, responsable, frente_id,
    fecha_identificacion, fecha_compromiso, estado, prioridad, impacto, acciones
  } = req.body;
  if (!descripcion || !tipo || !fecha_identificacion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const result = db.prepare(`
    INSERT INTO restricciones
    (codigo, descripcion, tipo, responsable, frente_id, fecha_identificacion, fecha_compromiso, estado, prioridad, impacto, acciones, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    codigo || null, descripcion, tipo, responsable || null, frente_id || null,
    fecha_identificacion, fecha_compromiso || null,
    estado || 'abierta', prioridad || 'media', impacto || null, acciones || null,
    req.user.id
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/restricciones/:id
router.put('/:id', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const {
    codigo, descripcion, tipo, responsable, frente_id,
    fecha_identificacion, fecha_compromiso, fecha_levantamiento,
    estado, prioridad, impacto, acciones
  } = req.body;
  db.prepare(`
    UPDATE restricciones SET
    codigo=?, descripcion=?, tipo=?, responsable=?, frente_id=?,
    fecha_identificacion=?, fecha_compromiso=?, fecha_levantamiento=?,
    estado=?, prioridad=?, impacto=?, acciones=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    codigo, descripcion, tipo, responsable, frente_id,
    fecha_identificacion, fecha_compromiso, fecha_levantamiento,
    estado, prioridad, impacto, acciones, req.params.id
  );
  res.json({ success: true });
});

// DELETE /api/restricciones/:id (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM restricciones WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/restricciones/stats/resumen
router.get('/stats/resumen', authenticateToken, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM restricciones').get();
  const abiertas = db.prepare("SELECT COUNT(*) as cnt FROM restricciones WHERE estado = 'abierta'").get();
  const levantadas = db.prepare("SELECT COUNT(*) as cnt FROM restricciones WHERE estado = 'levantada'").get();
  const porTipo = db.prepare("SELECT tipo, COUNT(*) as cnt FROM restricciones GROUP BY tipo").all();
  const porPrioridad = db.prepare("SELECT prioridad, COUNT(*) as cnt FROM restricciones GROUP BY prioridad").all();
  res.json({ total: total.cnt, abiertas: abiertas.cnt, levantadas: levantadas.cnt, porTipo, porPrioridad });
});

module.exports = router;
