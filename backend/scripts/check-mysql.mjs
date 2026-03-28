/**
 * Comprueba conexión a MySQL según .env (mismo criterio que el servidor).
 * Uso: node scripts/check-mysql.mjs
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  if (!process.env.DB_HOST?.trim()) {
    console.log('No hay DB_HOST en .env → el backend usa SQLite; no se prueba MySQL.');
    process.exit(0);
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
  });

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    const [tables] = await conn.query('SHOW TABLES');
    conn.release();
    await pool.end();
    const count = Array.isArray(tables) ? tables.length : 0;
    console.log(`OK: conexión a MySQL (${process.env.DB_NAME}). Tablas visibles: ${count}`);
    if (count && count <= 40) {
      const names = tables.map((row) => Object.values(row)[0]).join(', ');
      console.log(names);
    }
    process.exit(0);
  } catch (e) {
    console.error('Error de conexión MySQL:', e.message);
    if (String(e.message).includes('Access denied')) {
      console.error(
        '\nSuele ser: (1) usuario/contraseña exactos del panel hPanel → Bases de datos MySQL,\n' +
          '(2) en Hostinger activar "MySQL remoto" y permitir tu IP (o % solo si entendés el riesgo),\n' +
          '(3) el usuario suele ser tipo u123456789_adminevi, no solo adminevi.\n'
      );
    }
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
