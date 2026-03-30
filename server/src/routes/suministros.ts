import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma }    from '../lib/prisma';
import { requireAuth, requireRol } from '../middleware/auth';
import { validate }  from '../middleware/validate';

const router = Router({ mergeParams: true }); // hereda :proyectoId del router padre
router.use(requireAuth);

const suministroSchema = z.object({
  descripcion:    z.string().min(3),
  proveedor:      z.string().min(2),
  fechaNecesaria: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaLlegada:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leadTimeDias:   z.number().int().positive().optional(),
  estado:         z.enum(['EN_PROCESO','EN_TRANSITO','EN_ADUANA','ENTREGADO','PENDIENTE_OC']).optional(),
  obs:            z.string().optional(),
});

type Params = { proyectoId: string; id?: string };

// GET /api/proyectos/:proyectoId/suministros
router.get('/', async (req: Request<Params>, res: Response) => {
  const items = await prisma.suministro.findMany({
    where:   { proyectoId: req.params.proyectoId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

// POST /api/proyectos/:proyectoId/suministros
router.post('/', requireRol('ADMIN', 'RESIDENTE'), validate(suministroSchema), async (req: Request<Params>, res: Response) => {
  const data = req.body as z.infer<typeof suministroSchema>;
  const item = await prisma.suministro.create({
    data: {
      ...data,
      proyectoId:     req.params.proyectoId,
      creadoPorId:    req.user!.userId,
      fechaNecesaria: new Date(data.fechaNecesaria),
      fechaLlegada:   new Date(data.fechaLlegada),
    },
  });
  res.status(201).json(item);
});

// PATCH /api/proyectos/:proyectoId/suministros/:id
router.patch('/:id', requireRol('ADMIN', 'RESIDENTE', 'SUPERVISOR'), async (req: Request<Params>, res: Response) => {
  const item = await prisma.suministro.update({
    where: { id: req.params.id },
    data:  req.body,
  });
  res.json(item);
});

// DELETE /api/proyectos/:proyectoId/suministros/:id
router.delete('/:id', requireRol('ADMIN', 'RESIDENTE'), async (req: Request<Params>, res: Response) => {
  await prisma.suministro.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
