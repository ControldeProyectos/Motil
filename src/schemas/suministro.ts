import { z } from 'zod';

export const suministroSchema = z.object({
  descripcion: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'Máximo 200 caracteres'),

  proveedor: z
    .string()
    .min(2, 'Ingresa el nombre del proveedor')
    .max(100, 'Máximo 100 caracteres'),

  fechaNecesaria: z
    .string()
    .min(1, 'La fecha necesaria en obra es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),

  fechaLlegada: z
    .string()
    .min(1, 'La fecha estimada de llegada es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),

  leadTime: z.string().optional(),

  estado: z.enum(
    ['En proceso', 'En tránsito', 'En aduana', 'Entregado', 'Pendiente OC'],
    { error: 'Estado inválido' },
  ),

  obs: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
});

export type SuministroInput = z.infer<typeof suministroSchema>;
