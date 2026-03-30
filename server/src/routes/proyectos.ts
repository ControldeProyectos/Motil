import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma }    from '../lib/prisma';
import { requireAuth, requireRol } from '../middleware/auth';
import { validate }  from '../middleware/validate';

const router = Router();
router.use(requireAuth);

type Params = { id: string };

const proyectoSchema = z.object({
  nombre:       z.string().min(3),
  descripcion:  z.string().optional(),
  valorContrato: z.number().positive(),
  fechaInicio:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  semanaActual: z.number().int().min(1).optional(),
});

// GET /api/proyectos
router.get('/', async (_req: Request, res: Response) => {
  const proyectos = await prisma.proyecto.findMany({
    where:   { activo: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(proyectos);
});

// GET /api/proyectos/:id
router.get('/:id', async (req: Request<Params>, res: Response) => {
  const p = await prisma.proyecto.findUnique({ where: { id: req.params.id } });
  if (!p) { res.status(404).json({ error: 'Proyecto no encontrado' }); return; }
  res.json(p);
});

// POST /api/proyectos
router.post('/', requireRol('ADMIN', 'RESIDENTE'), validate(proyectoSchema), async (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof proyectoSchema>;
  const p = await prisma.proyecto.create({
    data: {
      ...data,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin:    new Date(data.fechaFin),
    },
  });
  res.status(201).json(p);
});

// PATCH /api/proyectos/:id
router.patch('/:id', requireRol('ADMIN', 'RESIDENTE'), async (req: Request<Params>, res: Response) => {
  const p = await prisma.proyecto.update({
    where: { id: req.params.id },
    data:  req.body,
  });
  res.json(p);
});

export default router;
