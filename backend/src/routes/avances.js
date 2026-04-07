const express = require('express');
const { db } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/avances/semanas
router.get('/semanas', authenticateToken, (req, res) => {
  const semanas = db.prepare('SELECT * FROM semanas ORDER BY numero').all();
  res.json(semanas);
});

// GET /api/avances/semanas/:id
router.get('/semanas/:id', authenticateToken, (req, res) => {
  const semana = db.prepare('SELECT * FROM semanas WHERE id = ?').get(req.params.id);
  if (!semana) return res.status(404).json({ error: 'Semana no encontrada' });
  res.json(semana);
});

// POST /api/avances/semanas
router.post('/semanas', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { numero, fecha, avance_real, avance_planificado, avance_contractual, observaciones } = req.body;
  const result = db.prepare(`
    INSERT INTO semanas (numero, fecha, avance_real, avance_planificado, avance_contractual, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(numero, fecha, avance_real || 0, avance_planificado || 0, avance_contractual || 0, observaciones || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/avances/semanas/:id
router.put('/semanas/:id', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { avance_real, avance_planificado, avance_contractual, observaciones, cerrada } = req.body;
  db.prepare(`
    UPDATE semanas SET avance_real=?, avance_planificado=?, avance_contractual=?, observaciones=?, cerrada=?
    WHERE id=?
  `).run(avance_real, avance_planificado, avance_contractual, observaciones, cerrada ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// GET /api/avances/frentes
router.get('/frentes', authenticateToken, (req, res) => {
  const frentes = db.prepare('SELECT * FROM frentes WHERE activo = 1').all();
  res.json(frentes);
});

// GET /api/avances/actividades?frente_id=1
router.get('/actividades', authenticateToken, (req, res) => {
  const { frente_id } = req.query;
  let query = 'SELECT a.*, f.nombre as frente_nombre, f.tipo as frente_tipo FROM actividades a JOIN frentes f ON a.frente_id = f.id WHERE a.activo = 1';
  const params = [];
  if (frente_id) {
    query += ' AND a.frente_id = ?';
    params.push(frente_id);
  }
  query += ' ORDER BY a.frente_id, a.codigo';
  const actividades = db.prepare(query).all(...params);
  res.json(actividades);
});

// POST /api/avances/actividades
router.post('/actividades', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { frente_id, codigo, nombre, descripcion, unidad, metrado_total, peso } = req.body;
  const result = db.prepare(`
    INSERT INTO actividades (frente_id, codigo, nombre, descripcion, unidad, metrado_total, peso)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(frente_id, codigo, nombre, descripcion || '', unidad || 'glb', metrado_total || 0, peso || 0);
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/avances/actividades/:id
router.put('/actividades/:id', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { codigo, nombre, descripcion, unidad, metrado_total, peso } = req.body;
  db.prepare(`
    UPDATE actividades SET codigo=?, nombre=?, descripcion=?, unidad=?, metrado_total=?, peso=?
    WHERE id=?
  `).run(codigo, nombre, descripcion, unidad, metrado_total, peso, req.params.id);
  res.json({ success: true });
});

// GET /api/avances/detalle?semana_id=17
router.get('/detalle', authenticateToken, (req, res) => {
  const { semana_id, frente_id } = req.query;
  let query = `
    SELECT aa.*, a.codigo, a.nombre, a.unidad, a.metrado_total, a.peso,
           f.nombre as frente_nombre, f.tipo as frente_tipo,
           s.numero as semana_numero, s.fecha as semana_fecha
    FROM avance_actividades aa
    JOIN actividades a ON aa.actividad_id = a.id
    JOIN frentes f ON a.frente_id = f.id
    JOIN semanas s ON aa.semana_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (semana_id) { query += ' AND aa.semana_id = ?'; params.push(semana_id); }
  if (frente_id) { query += ' AND a.frente_id = ?'; params.push(frente_id); }
  query += ' ORDER BY f.id, a.codigo';
  const detalles = db.prepare(query).all(...params);
  res.json(detalles);
});

// POST /api/avances/detalle
router.post('/detalle', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { actividad_id, semana_id, avance_planificado, avance_real, metrado_ejecutado, observaciones } = req.body;
  const result = db.prepare(`
    INSERT OR REPLACE INTO avance_actividades
    (actividad_id, semana_id, avance_planificado, avance_real, metrado_ejecutado, observaciones, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(actividad_id, semana_id, avance_planificado || 0, avance_real || 0, metrado_ejecutado || 0, observaciones || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/avances/curva-s
router.get('/curva-s', authenticateToken, (req, res) => {
  const data = db.prepare('SELECT * FROM curva_s ORDER BY semana').all();
  res.json(data);
});

module.exports = router;
