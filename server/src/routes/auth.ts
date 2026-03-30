import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma }    from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { validate }  from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email:  z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre requerido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, nombre, password } = req.body as z.infer<typeof registerSchema>;
  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    res.status(409).json({ error: 'El email ya está registrado' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.usuario.create({
    data: { email, nombre, passwordHash },
    select: { id: true, email: true, nombre: true, rol: true },
  });
  const token = signToken({ userId: user.id, email: user.email, rol: user.rol });
  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user || !user.activo) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, rol: user.rol });
  res.json({ token, user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol } });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.usuario.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, nombre: true, rol: true },
  });
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
  res.json(user);
});

export default router;
