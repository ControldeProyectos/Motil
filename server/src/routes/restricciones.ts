import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma }    from '../lib/prisma';
import { requireAuth, requireRol } from '../middleware/auth';
import { validate }  from '../middleware/validate';

const router = Router({ mergeParams: true });
router.use(requireAuth);

const restriccionSchema = z.object({
  descripcion:   z.string().min(5),
  responsable:   z.string().min(2),
  fechaAtencion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo:          z.enum(['CRITICA','NO_CRITICA']).optional(),
  estado:        z.enum(['ABIERTA','EN_PROCESO','CERRADA']).optional(),
  obs:           z.string().optional(),
});

type Params = { proyectoId: string; id?: string };

// GET /api/proyectos/:proyectoId/restricciones
router.get('/', async (req: Request<Params>, res: Response) => {
  const items = await prisma.restriccion.findMany({
    where:   { proyectoId: req.params.proyectoId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

// POST
router.post('/', requireRol('ADMIN','RESIDENTE'), validate(restriccionSchema), async (req: Request<Params>, res: Response) => {
  const data = req.body as z.infer<typeof restriccionSchema>;
  const item = await prisma.restriccion.create({
    data: {
      ...data,
      proyectoId:    req.params.proyectoId,
      creadoPorId:   req.user!.userId,
      fechaAtencion: new Date(data.fechaAtencion),
    },
  });
  res.status(201).json(item);
});

// PATCH /:id (cambiar estado, etc.)
router.patch('/:id', requireRol('ADMIN','RESIDENTE','SUPERVISOR'), async (req: Request<Params>, res: Response) => {
  const item = await prisma.restriccion.update({
    where: { id: req.params.id },
    data:  req.body,
  });
  res.json(item);
});

// DELETE /:id
router.delete('/:id', requireRol('ADMIN','RESIDENTE'), async (req: Request<Params>, res: Response) => {
  await prisma.restriccion.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
