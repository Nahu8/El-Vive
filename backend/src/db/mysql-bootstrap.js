/**
 * Tablas que el backend Node puede necesitar y que a veces no existen en BD heredadas de Laravel.
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
