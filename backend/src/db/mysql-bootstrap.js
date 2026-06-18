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
        throw e;
      }
    }
  } finally {
    conn.release();
  }
}

export async function ensureMysqlAuxTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS section_icons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(191) NOT NULL,
      section_key VARCHAR(191) NOT NULL,
      imagePath TEXT NULL,
      imageMime TEXT NULL,
      imageName TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_section_icons_page_section (page_key, section_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
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

