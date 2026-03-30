import { z } from 'zod';

export const restriccionSchema = z.object({
  descripcion: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(300, 'Máximo 300 caracteres'),

  responsable: z
    .string()
    .min(2, 'Indica el responsable de levantar la restricción')
    .max(100, 'Máximo 100 caracteres'),

  fecha: z
    .string()
    .min(1, 'La fecha de atención es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),

  tipo: z.enum(['critica', 'no-critica'], {
    error: 'El tipo debe ser "critica" o "no-critica"',
  }),

  estado: z.enum(['abierta', 'en-proceso', 'cerrada'], {
    error: 'Estado inválido',
  }),

  obs: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
});

export type RestriccionInput = z.infer<typeof restriccionSchema>;
