const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/motil.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _instance = null; // SQLiteCompat instance

// ─────────────────────────────────────────────────────────────
// Compatibility wrapper: mirrors the better-sqlite3 API
// ─────────────────────────────────────────────────────────────
class SQLiteCompat {
  constructor(sqlDb) {
    this._sql = sqlDb;
  }

  _save() {
    try {
      const data = this._sql.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }

  // Normalize args for sql.js: handles both spread and array styles
  _params(args) {
    if (args.length === 0) return [];
    if (args.length === 1 && Array.isArray(args[0])) return args[0];
    return Array.from(args);
  }

  pragma(_stmt) { /* no-op — sql.js handles internally */ }

  // Run multi-statement DDL (CREATE TABLE, etc.)
  exec(sql) {
    this._sql.exec(sql);
    this._save();
  }

  prepare(sql) {
    const self = this;
    return {
      run(...args) {
        const params = self._params(args);
        try {
          self._sql.run(sql, params.length ? params : undefined);
        } catch (e) {
          // INSERT OR IGNORE — ignore unique constraint silently
          if (!e.message?.includes('UNIQUE constraint failed')) throw e;
        }
        const r = self._sql.exec('SELECT last_insert_rowid() AS id');
        const lastInsertRowid = r[0]?.values?.[0]?.[0] ?? null;
        self._save();
        return { lastInsertRowid };
      },
      get(...args) {
        const params = self._params(args);
        const r = self._sql.exec(sql, params.length ? params : undefined);
        if (!r.length || !r[0].values.length) return undefined;
        return Object.fromEntries(r[0].columns.map((c, i) => [c, r[0].values[0][i]]));
      },
      all(...args) {
        const params = self._params(args);
        const r = self._sql.exec(sql, params.length ? params : undefined);
        if (!r.length) return [];
        const { columns, values } = r[0];
        return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
      }
    };
  }

  close() {
    this._save();
    this._sql.close();
  }
}

// ─────────────────────────────────────────────────────────────
// Proxy: lets routes import `db` before async init completes
// (routes only run after initializeDatabase() resolves)
// ─────────────────────────────────────────────────────────────
const db = new Proxy({}, {
  get(_, prop) {
    if (!_instance) throw new Error('Database not initialized yet');
    const v = _instance[prop];
    return typeof v === 'function' ? v.bind(_instance) : v;
  }
});

async function initializeDatabase() {
  if (_instance) return;

  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buf);
  } else {
    sqlDb = new SQL.Database();
  }

  _instance = new SQLiteCompat(sqlDb);

  // Create all tables (one at a time — sql.js run() is single-statement)
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'viewer',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS proyecto (
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
    )`,
    `CREATE TABLE IF NOT EXISTS semanas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      avance_real REAL DEFAULT 0,
      avance_planificado REAL DEFAULT 0,
      avance_contractual REAL DEFAULT 0,
      observaciones TEXT,
      cerrada INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS frentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frente_id INTEGER NOT NULL,
      codigo TEXT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      unidad TEXT DEFAULT 'glb',
      metrado_total REAL DEFAULT 0,
      peso REAL DEFAULT 0,
      activo INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS avance_actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actividad_id INTEGER NOT NULL,
      semana_id INTEGER NOT NULL,
      avance_planificado REAL DEFAULT 0,
      avance_real REAL DEFAULT 0,
      metrado_ejecutado REAL DEFAULT 0,
      observaciones TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(actividad_id, semana_id)
    )`,
    `CREATE TABLE IF NOT EXISTS restricciones (
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
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS suministros (
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
    )`,
    `CREATE TABLE IF NOT EXISTS curva_s (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semana INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      planificado_acum REAL DEFAULT 0,
      real_acum REAL,
      contractual_acum REAL DEFAULT 0
    )`,
  ];

  for (const sql of tables) {
    sqlDb.run(sql);
  }

  _instance._save();
}

module.exports = { db, initializeDatabase };
