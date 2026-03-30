import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Usuario administrador
  const adminPass = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.usuario.upsert({
    where:  { email: 'admin@cmejia.pe' },
    update: {},
    create: {
      email:        'admin@cmejia.pe',
      passwordHash: adminPass,
      nombre:       'Administrador MOTIL',
      rol:          'ADMIN',
    },
  });
  console.log('✓ Usuario admin:', admin.email);

  // Proyecto MOTIL
  const proyecto = await prisma.proyecto.upsert({
    where:  { id: 'motil-001' },
    update: {},
    create: {
      id:            'motil-001',
      nombre:        'MOTIL — Subestación Eléctrica Motil',
      descripcion:   'S.E. Motil — Control de Avance de Obra',
      valorContrato: 3090285.88,
      fechaInicio:   new Date('2025-11-14'),
      fechaFin:      new Date('2027-01-07'),
      semanaActual:  17,
    },
  });
  console.log('✓ Proyecto:', proyecto.nombre);

  // Restricciones de demo
  const restriccionesData = [
    {
      descripcion:   'Falta de planos IFC para inicio de obras de concreto armado — Patio de Llaves',
      responsable:   'Ing. Diseño / Oficina Técnica',
      fechaAtencion: new Date('2026-03-28'),
      tipo:          'CRITICA' as const,
      estado:        'ABIERTA' as const,
      obs:           'Sin planos IFC aprobados no se puede iniciar hincado de pilotes ni encofrado.',
    },
    {
      descripcion:   'Transformador de Potencia 138/33kV sin fecha de entrega confirmada',
      responsable:   'Logística / Adquisiciones',
      fechaAtencion: new Date('2026-04-10'),
      tipo:          'CRITICA' as const,
      estado:        'EN_PROCESO' as const,
      obs:           'Proveedor Siemens reporta demora. Se gestiona alternativa con ABB.',
    },
    {
      descripcion:   'Permiso municipal de excavación no emitido para Sala de Control',
      responsable:   'Gestión de Permisos / Área Legal',
      fechaAtencion: new Date('2026-04-05'),
      tipo:          'NO_CRITICA' as const,
      estado:        'ABIERTA' as const,
      obs:           'Municipalidad requiere plano de impacto vial y póliza adicional.',
    },
  ];

  for (const r of restriccionesData) {
    await prisma.restriccion.create({
      data: { ...r, proyectoId: proyecto.id, creadoPorId: admin.id },
    });
  }
  console.log(`✓ ${restriccionesData.length} restricciones demo creadas`);

  console.log('\nSeed completado.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
