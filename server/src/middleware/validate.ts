import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/** Valida req.body con un schema Zod. Rechaza con 400 si falla. */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error:  'Datos inválidos',
        issues: result.error.issues.map(i => ({
          field:   i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
