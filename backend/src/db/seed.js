const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./schema');

async function seed() {
  console.log('Initializing database...');
  await initializeDatabase();

  // Seed users
  const hashedAdmin = bcrypt.hashSync('admin123', 10);
  const hashedUser  = bcrypt.hashSync('motil2025', 10);
  const hashedView  = bcrypt.hashSync('ver123', 10);

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (username, password, nombre, rol) VALUES (?, ?, ?, ?)'
  );
  insertUser.run('admin',  hashedAdmin, 'Administrador',   'admin');
  insertUser.run('cmejia', hashedUser,  'C. Mejia S.A.C.', 'editor');
  insertUser.run('viewer', hashedView,  'Visitante',       'viewer');
  console.log('Users created: admin / admin123, cmejia / motil2025, viewer / ver123');

  // Seed project
  db.prepare(`
    INSERT OR IGNORE INTO proyecto
    (id, nombre, empresa, descripcion, fecha_inicio, fecha_fin_contractual, valor_contrato, moneda, frentes_trabajo, semana_actual)
    VALUES (1, 'PROYECTO MOTIL', 'C MEJIA S.A.C.', 'S.E. MOTIL - CONTROL DE AVANCE DE OBRA',
            '2025-11-14', '2027-01-07', 3090285.88, 'USD', 3, 17)
  `).run();

  // Seed frentes
  const iFrente = db.prepare('INSERT OR IGNORE INTO frentes (id, nombre, tipo, descripcion) VALUES (?, ?, ?, ?)');
  iFrente.run(1, 'Civil',          'civil',          'Obras civiles y estructurales');
  iFrente.run(2, 'Electromecánica','electromecanica', 'Obras electromecánicas');
  iFrente.run(3, 'Arquitectura',   'arquitectura',    'Obras de arquitectura y acabados');

  // Seed actividades
  const iAct = db.prepare(
    'INSERT OR IGNORE INTO actividades (id, frente_id, codigo, nombre, unidad, metrado_total, peso) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  // Civil
  iAct.run(1,  1, 'CIV-001', 'Movimiento de tierras',   'm3',  5000, 8.5);
  iAct.run(2,  1, 'CIV-002', 'Cimentaciones',            'm3',   350, 12.0);
  iAct.run(3,  1, 'CIV-003', 'Estructura de concreto',   'm3',   800, 18.5);
  iAct.run(4,  1, 'CIV-004', 'Muros y tabiques',         'm2',  2200, 10.0);
  iAct.run(5,  1, 'CIV-005', 'Losas y techos',           'm2',  1500, 15.0);
  // Electromecánica
  iAct.run(6,  2, 'EM-001',  'Instalaciones eléctricas', 'glb',    1, 14.0);
  iAct.run(7,  2, 'EM-002',  'Equipos de potencia',      'und',   12, 16.5);
  iAct.run(8,  2, 'EM-003',  'Tableros eléctricos',      'und',    8,  8.0);
  iAct.run(9,  2, 'EM-004',  'Canalizaciones y bandejas','m',   3200,  7.5);
  iAct.run(10, 2, 'EM-005',  'Puesta a tierra',          'glb',    1,  5.0);
  // Arquitectura
  iAct.run(11, 3, 'ARQ-001', 'Pisos y pavimentos',       'm2',  1800,  6.5);
  iAct.run(12, 3, 'ARQ-002', 'Carpintería metálica',     'glb',    1,  4.5);
  iAct.run(13, 3, 'ARQ-003', 'Pintura y acabados',       'm2',  3500,  4.0);

  // Seed semanas S1-S17
  const iSem = db.prepare(
    'INSERT OR IGNORE INTO semanas (id, numero, fecha, avance_real, avance_planificado, avance_contractual, cerrada) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const semanasData = [
    [1,  1,  '2025-11-21', 0.30, 0.30, 0.10, 1],
    [2,  2,  '2025-11-28', 0.65, 0.65, 0.20, 1],
    [3,  3,  '2025-12-05', 1.10, 1.10, 0.35, 1],
    [4,  4,  '2025-12-12', 1.60, 1.60, 0.50, 1],
    [5,  5,  '2025-12-19', 2.10, 2.10, 0.65, 1],
    [6,  6,  '2025-12-26', 2.55, 2.55, 0.80, 1],
    [7,  7,  '2026-01-02', 3.00, 3.00, 0.95, 1],
    [8,  8,  '2026-01-09', 3.50, 3.50, 1.10, 1],
    [9,  9,  '2026-01-16', 4.10, 4.10, 1.25, 1],
    [10, 10, '2026-01-23', 4.80, 4.80, 1.40, 1],
    [11, 11, '2026-01-30', 5.50, 5.50, 1.55, 1],
    [12, 12, '2026-02-06', 6.20, 6.20, 1.65, 1],
    [13, 13, '2026-02-13', 6.90, 6.90, 1.75, 1],
    [14, 14, '2026-02-20', 7.40, 7.40, 1.85, 1],
    [15, 15, '2026-02-27', 7.85, 7.85, 1.95, 1],
    [16, 16, '2026-03-06', 8.20, 8.20, 2.00, 1],
    [17, 17, '2026-03-16', 8.55, 8.55, 2.08, 0],
  ];
  semanasData.forEach(s => iSem.run(...s));

  // Seed curva S
  const iCurva = db.prepare(
    'INSERT OR IGNORE INTO curva_s (semana, fecha, planificado_acum, real_acum, contractual_acum) VALUES (?, ?, ?, ?, ?)'
  );
  semanasData.forEach(([_id, num, fecha, real, plan, contrac]) => {
    iCurva.run(num, fecha, plan, real, contrac);
  });
  const futurePlanned = [
    [18, '2026-03-23',  9.20, null,  2.50],
    [20, '2026-04-06', 10.80, null,  3.10],
    [25, '2026-05-11', 15.00, null,  5.00],
    [30, '2026-06-15', 22.00, null,  8.00],
    [35, '2026-07-20', 32.00, null, 13.00],
    [40, '2026-08-24', 44.00, null, 20.00],
    [45, '2026-09-28', 57.00, null, 30.00],
    [50, '2026-11-02', 70.00, null, 42.00],
    [55, '2026-12-07', 81.00, null, 56.00],
    [60, '2027-01-11', 90.00, null, 70.00],
    [65, '2027-02-15', 96.00, null, 83.00],
    [70, '2027-03-22',100.00, null, 95.00],
  ];
  futurePlanned.forEach(row => iCurva.run(...row));

  // Seed restricciones
  const iRes = db.prepare(`
    INSERT OR IGNORE INTO restricciones
    (id, codigo, descripcion, tipo, responsable, frente_id, fecha_identificacion, fecha_compromiso, estado, prioridad, impacto, acciones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  iRes.run(1,'RES-001','Falta de planos aprobados para cimentaciones bloque B','diseño','Ing. Ramírez',1,'2026-03-01','2026-03-20','abierta','alta','Retraso de 2 semanas en inicio de cimentaciones','Coordinación con oficina técnica para liberación de planos');
  iRes.run(2,'RES-002','Pendiente aprobación de equipos de potencia por cliente','aprobacion','Jefe de Proyecto',2,'2026-02-15','2026-03-10','abierta','alta','No se puede iniciar instalación eléctrica','Enviar ficha técnica al supervisor del cliente');
  iRes.run(3,'RES-003','Acceso restringido a zona norte por trabajos de terceros','acceso','Coordinación Obra',1,'2026-03-10','2026-03-25','levantada','media','Limitación de frente de trabajo','Coordinación con contratista de área');
  iRes.run(4,'RES-004','Proveedor de acero con retraso en entrega','suministro','Logística',1,'2026-03-05','2026-03-30','abierta','alta','Posible paralización de estructura metálica','Contactar proveedores alternativos');
  iRes.run(5,'RES-005','Permiso municipal de excavación pendiente','permisos','Residente',1,'2026-02-20','2026-03-05','levantada','alta','Retraso en inicio de excavaciones','Gestión ante municipalidad completada');

  // Seed suministros
  const iSum = db.prepare(`
    INSERT OR IGNORE INTO suministros
    (id, codigo, descripcion, categoria, unidad, cantidad_requerida, cantidad_disponible, fecha_requerida, proveedor, estado, alerta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  iSum.run(1,'SUM-001','Acero de refuerzo Ø 1/2"',   'acero',   'kg', 15000,12000,'2026-04-15','Aceros Arequipa','parcial', 0);
  iSum.run(2,'SUM-002','Cemento Portland Tipo I',     'cemento', 'bls', 2000, 2000,'2026-04-01','Yura S.A.',     'completo',0);
  iSum.run(3,'SUM-003','Transformador 500 KVA',       'equipos', 'und',    2,    0,'2026-05-01','ABB Perú',      'pendiente',1);
  iSum.run(4,'SUM-004','Cable THW 3x4mm2',            'cables',  'm',  5000, 1500,'2026-04-20','Indeco',         'parcial', 1);
  iSum.run(5,'SUM-005','Tablero eléctrico TD-01',     'tableros','und',    4,    4,'2026-03-30','Schneider',     'completo',0);
  iSum.run(6,'SUM-006','Concreto premezclado f\'c=210','concreto','m3',  800,    0,'2026-04-25','UNICON',        'pendiente',0);

  // Seed avance actividades
  const iAv = db.prepare(
    'INSERT OR IGNORE INTO avance_actividades (actividad_id, semana_id, avance_planificado, avance_real, metrado_ejecutado) VALUES (?, ?, ?, ?, ?)'
  );
  [[1,15,100,100,5000],[2,15,85,85,297.5],[3,15,30,28,224],[6,15,15,12,0],[7,15,0,0,0],
   [1,16,100,100,5000],[2,16,95,95,332.5],[3,16,40,38,304],[6,16,20,18,0],[7,16,5,3,0],
   [1,17,100,100,5000],[2,17,100,100,350],[3,17,48,46,368],[6,17,25,22,0],[7,17,8,5,0],
  ].forEach(row => iAv.run(...row));

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  admin   / admin123   (Administrador)');
  console.log('  cmejia  / motil2025  (Editor)');
  console.log('  viewer  / ver123     (Visitante)');
}

seed().catch(err => { console.error(err); process.exit(1); });
