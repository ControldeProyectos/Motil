const express = require('express');
const { db } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/proyecto
router.get('/', authenticateToken, (req, res) => {
  const proyecto = db.prepare('SELECT * FROM proyecto WHERE id = 1').get();
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(proyecto);
});

// PUT /api/proyecto
router.put('/', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  const { nombre, empresa, descripcion, fecha_inicio, fecha_fin_contractual, valor_contrato, moneda, frentes_trabajo, semana_actual } = req.body;
  db.prepare(`
    UPDATE proyecto SET nombre=?, empresa=?, descripcion=?, fecha_inicio=?, fecha_fin_contractual=?,
    valor_contrato=?, moneda=?, frentes_trabajo=?, semana_actual=?, updated_at=datetime('now')
    WHERE id = 1
  `).run(nombre, empresa, descripcion, fecha_inicio, fecha_fin_contractual, valor_contrato, moneda, frentes_trabajo, semana_actual);
  res.json({ success: true });
});

// GET /api/proyecto/dashboard - Summary for dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  const proyecto = db.prepare('SELECT * FROM proyecto WHERE id = 1').get();
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const semanaActual = db.prepare('SELECT * FROM semanas WHERE numero = ?').get(proyecto.semana_actual);
  const semanaPrev = db.prepare('SELECT * FROM semanas WHERE numero = ?').get(proyecto.semana_actual - 1);

  const restriccionesAbiertas = db.prepare("SELECT COUNT(*) as cnt FROM restricciones WHERE estado = 'abierta'").get();
  const alertasSuministros = db.prepare("SELECT COUNT(*) as cnt FROM suministros WHERE alerta = 1").get();

  // Calculate days remaining
  const hoy = new Date();
  const finContractual = new Date(proyecto.fecha_fin_contractual);
  const diasRestantes = Math.ceil((finContractual - hoy) / (1000 * 60 * 60 * 24));

  const avanceReal = semanaActual ? semanaActual.avance_real : 0;
  const avancePlanificado = semanaActual ? semanaActual.avance_planificado : 0;
  const avanceContractual = semanaActual ? semanaActual.avance_contractual : 0;
  const avancePrevReal = semanaPrev ? semanaPrev.avance_real : 0;
  const avancePrevPlan = semanaPrev ? semanaPrev.avance_planificado : 0;

  res.json({
    proyecto,
    semanaActual: semanaActual || {},
    diasRestantes,
    avanceReal,
    avancePlanificado,
    avanceContractual,
    desviacion: avanceReal - avancePlanificado,
    adelantoContractual: avanceReal - avanceContractual,
    incrementoSemanal: avanceReal - avancePrevReal,
    restriccionesAbiertas: restriccionesAbiertas.cnt,
    alertasSuministros: alertasSuministros.cnt,
  });
});

module.exports = router;
