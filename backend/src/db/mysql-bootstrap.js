import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripLineComments(sql) {
  return sql
    .split('\n')
    .filter((line) => !/^\s*--/.test(line))
    .join('\n');
}

/**
 * Aplica scripts/mysql-schema-hostinger.sql (idempotente: solo CREATE IF NOT EXISTS).
 * Sentencia a sentencia: algunos entornos no aplican bien varias sentencias en un solo query().
 */
export async function ensureMysqlFullSchema(pool) {
  const sqlPath = path.join(__dirname, '../../scripts/mysql-schema-hostinger.sql');
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`[mysql] Archivo de esquema no encontrado: ${sqlPath}`);
  }
  const raw = fs.readFileSync(sqlPath, 'utf8');
  const statements = stripLineComments(raw)
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const conn = await pool.getConnection();
  try {
    for (let i = 0; i < statements.length; i++) {
      const st = statements[i];
      try {
        await conn.query(`${st};`);
      } catch (e) {
        console.error(
          `[mysql] Error en sentencia ${i + 1}/${statements.length} (${st.slice(0, 72)}…):`,
          e?.message || e
        );
        throw e;
      }
    }
  } finally {
    conn.release();
  }
}

/**
 * Tablas auxiliares por si el SQL maestro no se ejecutó (BD heredada).
 * @deprecated Preferir ensureMysqlFullSchema; se mantiene por compatibilidad.
 */
export async function ensureMysqlAuxTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generic_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(191) NOT NULL UNIQUE,
      page_content LONGTEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ministry_pdfs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ministryId VARCHAR(191) NOT NULL UNIQUE,
      filePath TEXT NULL,
      fileMime VARCHAR(255) NULL,
      fileName VARCHAR(512) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
