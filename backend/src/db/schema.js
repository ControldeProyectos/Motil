const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/motil.db');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'viewer',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Project configuration
    CREATE TABLE IF NOT EXISTS proyecto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      empresa TEXT NOT NULL,
      descripcion TEXT,
      fecha_inicio TEXT NOT NULL,
      fecha_fin_contractual TEXT NOT NULL,
      valor_contrato REAL NOT NULL,
      moneda TEXT DEFAULT 'USD',
      frentes_trabajo INTEGER DEFAULT 1,
      semana_actual INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Semanas de avance
    CREATE TABLE IF NOT EXISTS semanas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      avance_real REAL DEFAULT 0,
      avance_planificado REAL DEFAULT 0,
      avance_contractual REAL DEFAULT 0,
      observaciones TEXT,
      cerrada INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Frentes de trabajo (Civil / Electromecánica / etc.)
    CREATE TABLE IF NOT EXISTS frentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1
    );

    -- Actividades por frente
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frente_id INTEGER NOT NULL,
      codigo TEXT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      unidad TEXT DEFAULT 'glb',
      metrado_total REAL DEFAULT 0,
      peso REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (frente_id) REFERENCES frentes(id)
    );

    -- Avance por actividad y semana
    CREATE TABLE IF NOT EXISTS avance_actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actividad_id INTEGER NOT NULL,
      semana_id INTEGER NOT NULL,
      avance_planificado REAL DEFAULT 0,
      avance_real REAL DEFAULT 0,
      metrado_ejecutado REAL DEFAULT 0,
      observaciones TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (actividad_id) REFERENCES actividades(id),
      FOREIGN KEY (semana_id) REFERENCES semanas(id),
      UNIQUE(actividad_id, semana_id)
    );

    -- Restricciones
    CREATE TABLE IF NOT EXISTS restricciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      descripcion TEXT NOT NULL,
      tipo TEXT NOT NULL,
      responsable TEXT,
      frente_id INTEGER,
      fecha_identificacion TEXT NOT NULL,
      fecha_compromiso TEXT,
      fecha_levantamiento TEXT,
      estado TEXT NOT NULL DEFAULT 'abierta',
      prioridad TEXT DEFAULT 'media',
      impacto TEXT,
      acciones TEXT,
      created_by INTEGER,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (frente_id) REFERENCES frentes(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Suministros
    CREATE TABLE IF NOT EXISTS suministros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      descripcion TEXT NOT NULL,
      categoria TEXT,
      unidad TEXT DEFAULT 'und',
      cantidad_requerida REAL DEFAULT 0,
      cantidad_disponible REAL DEFAULT 0,
      fecha_requerida TEXT,
      fecha_entrega TEXT,
      proveedor TEXT,
      estado TEXT DEFAULT 'pendiente',
      alerta INTEGER DEFAULT 0,
      observaciones TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Curva S data points
    CREATE TABLE IF NOT EXISTS curva_s (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semana INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      planificado_acum REAL DEFAULT 0,
      real_acum REAL DEFAULT 0,
      contractual_acum REAL DEFAULT 0
    );
  `);
}

module.exports = { db, initializeDatabase };
