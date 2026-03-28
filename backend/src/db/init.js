/**
 * Inicializa la base de datos y crea usuario admin por defecto si no existe.
 * Uso: node src/db/init.js
 */
import bcrypt from 'bcryptjs';
import { ensureDataDir } from './index.js';
import { runMigrations } from './schema.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/elvive.db');

ensureDataDir();
const db = new Database(dbPath);
runMigrations(db);

// Usuario admin por defecto (solo si la tabla está vacía)
const anyUser = db.prepare('SELECT id FROM users LIMIT 1').get();
if (!anyUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    "INSERT INTO users (username, password, role) VALUES (?, ?, 'superadmin')"
  ).run('admin', hash);
  console.log('Usuario creado: admin / admin123');
} else {
  console.log('La base de datos ya tiene usuarios (no se toca el admin por defecto).');
}

// Asegurar usuario específico para Él Vive
const SUPERADMIN_USERNAME = 'superadmin23380';
const SUPERADMIN_PASSWORD = 'MultimediaMinisterialElvive08!';

const existingSuperadmin = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get(SUPERADMIN_USERNAME);

if (!existingSuperadmin) {
  const hash = bcrypt.hashSync(SUPERADMIN_PASSWORD, 10);
  db.prepare(
    "INSERT INTO users (username, password, role) VALUES (?, ?, 'superadmin')"
  ).run(SUPERADMIN_USERNAME, hash);
  console.log(
    `Usuario superadmin creado: ${SUPERADMIN_USERNAME} / ${SUPERADMIN_PASSWORD}`
  );
} else {
  console.log(`Usuario superadmin '${SUPERADMIN_USERNAME}' ya existía (no modificado).`);
}

db.close();
console.log('Base de datos inicializada en:', dbPath);
