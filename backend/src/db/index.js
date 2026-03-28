import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/elvive.db');

export function ensureDataDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

let db = null;

export function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    runMigrations(db);
  }
  return db;
}

export function parseJson(value) {
  if (value == null || value === '') return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

export function stringifyJson(value) {
  if (value == null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}
