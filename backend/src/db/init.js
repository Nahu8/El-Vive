import 'dotenv/config';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDataDir } from './index.js';
import { runMigrations } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.DB_HOST?.trim()) {
  process.exit(1);
}

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/elvive.db');

ensureDataDir();
const db = new Database(dbPath);
runMigrations(db);

const anyUser = db.prepare('SELECT id FROM users LIMIT 1').get();
if (!anyUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'superadmin')").run('admin', hash);
}

const initUser = process.env.INIT_SUPERADMIN_USER?.trim();
const initPass = process.env.INIT_SUPERADMIN_PASSWORD;
if (initUser && initPass) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(initUser);
  if (!existing) {
    const hash = bcrypt.hashSync(initPass, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'superadmin')").run(initUser, hash);
  }
}

db.close();
process.exit(0);

