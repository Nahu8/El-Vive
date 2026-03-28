import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runMigrations } from './schema.js';
import { ensureMysqlAuxTables } from './mysql-bootstrap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let sqliteDb = null;
let pool = null;

export function useMysql() {
  return Boolean(
    process.env.DB_HOST?.trim() &&
      process.env.DB_USER !== undefined &&
      process.env.DB_PASSWORD !== undefined &&
      process.env.DB_NAME?.trim()
  );
}

export function ensureDataDir() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/elvive.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getSqliteDb() {
  if (!sqliteDb) {
    ensureDataDir();
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/elvive.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    runMigrations(sqliteDb);
  }
  return sqliteDb;
}

/**
 * Adapta SQL de SQLite a MySQL (solo lo que usa este proyecto).
 */
export function translateSql(sql) {
  if (!useMysql()) return sql;
  let s = sql
    .replace(/datetime\s*\(\s*'now'\s*\)/gi, 'UTC_TIMESTAMP()')
    .replace(/datetime\s*\(\s*\\'now\\'\s*\)/gi, 'UTC_TIMESTAMP()');
  s = s.replace(/date\s*\(\s*["']now["']\s*\)/gi, 'CURDATE()');

  const t = s.trim().replace(/\s+/g, ' ');
  if (t.startsWith('INSERT INTO section_icons')) {
    return `INSERT INTO section_icons (page_key, section_key, imagePath, imageMime, imageName) VALUES (?,?,?,?,?) AS new ON DUPLICATE KEY UPDATE imagePath=new.imagePath, imageMime=new.imageMime, imageName=new.imageName, updated_at=UTC_TIMESTAMP()`;
  }
  if (t.startsWith('INSERT INTO meeting_card_images')) {
    return `INSERT INTO meeting_card_images (cardIndex, imagePath, imageMime, imageName) VALUES (?,?,?,?) AS new ON DUPLICATE KEY UPDATE imagePath=new.imagePath, imageMime=new.imageMime, imageName=new.imageName, updated_at=UTC_TIMESTAMP()`;
  }
  return s;
}

export async function dbGet(sql, params = []) {
  const q = translateSql(sql);
  if (useMysql()) {
    const [rows] = await pool.execute(q, params);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return rows[0];
  }
  return getSqliteDb().prepare(q).get(...params);
}

export async function dbAll(sql, params = []) {
  const q = translateSql(sql);
  if (useMysql()) {
    const [rows] = await pool.execute(q, params);
    return Array.isArray(rows) ? rows : [];
  }
  return getSqliteDb().prepare(q).all(...params);
}

export async function dbRun(sql, params = []) {
  const q = translateSql(sql);
  if (useMysql()) {
    const [result] = await pool.execute(q, params);
    const header = result;
    return {
      lastInsertRowid: header.insertId ?? 0,
      changes: header.affectedRows ?? 0,
    };
  }
  return getSqliteDb().prepare(q).run(...params);
}

export async function initDatabase() {
  if (useMysql()) {
    const limit = Math.min(parseInt(process.env.DB_POOL_LIMIT || '10', 10), 25);
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: limit,
      enableKeepAlive: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
    });
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      await ensureMysqlAuxTables(pool);
    } finally {
      conn.release();
    }
    return;
  }
  getSqliteDb();
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}

/** Compatibilidad mínima con código legado sync (solo SQLite); no usar con MySQL. */
export function getDb() {
  if (useMysql()) {
    throw new Error('getDb() no está disponible con MySQL. Usá dbGet/dbAll/dbRun (async).');
  }
  return getSqliteDb();
}
