/**
 * Inicializa SQLite y opcionalmente crea usuarios iniciales.
 * No usar con MySQL (Hostinger): la BD ya debe existir y los usuarios se gestionan allí.
 *
 * Uso: node src/db/init.js
 * Variables opcionales: INIT_SUPERADMIN_USER, INIT_SUPERADMIN_PASSWORD (solo si no existe ese usuario)
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDataDir } from './index.js';
import { runMigrations } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.DB_HOST?.trim()) {
  console.error('Tenés DB_HOST en .env: este script es solo para SQLite local. En Hostinger no hace falta init-db.');
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
  console.log('Usuario creado: admin / admin123 (cambiá la contraseña en producción).');
} else {
  console.log('La base de datos ya tiene usuarios (no se creó admin por defecto).');
}

const initUser = process.env.INIT_SUPERADMIN_USER?.trim();
const initPass = process.env.INIT_SUPERADMIN_PASSWORD;
if (initUser && initPass) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(initUser);
  if (!existing) {
    const hash = bcrypt.hashSync(initPass, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'superadmin')").run(initUser, hash);
    console.log(`Usuario superadmin creado desde env: ${initUser}`);
  } else {
    console.log(`Usuario '${initUser}' ya existía (no modificado).`);
  }
}

db.close();
console.log('Base de datos inicializada en:', dbPath);
