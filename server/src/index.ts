import 'dotenv/config';
import express from 'express';
import cors    from 'cors';

import authRoutes         from './routes/auth';
import proyectosRoutes    from './routes/proyectos';
import suministrosRoutes  from './routes/suministros';
import restriccionesRoutes from './routes/restricciones';

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// ── Middleware global ────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/proyectos',   proyectosRoutes);
app.use('/api/proyectos/:proyectoId/suministros',   suministrosRoutes);
app.use('/api/proyectos/:proyectoId/restricciones', restriccionesRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler global ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Servidor MOTIL API escuchando en http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
