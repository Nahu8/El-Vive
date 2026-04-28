import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  if (!process.env.DB_HOST?.trim()) {
    process.exit(0);
  }

  const socketPath = process.env.DB_SOCKET_PATH?.trim();
  const pool = mysql.createPool({
    ...(socketPath ? { socketPath } : { host: process.env.DB_HOST }),
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
  });

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    await conn.query('SHOW TABLES');
    conn.release();
    await pool.end();
    process.exit(0);
  } catch {
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
