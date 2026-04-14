import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Hostinger a veces no muestra registros de runtime; esto escribe en backend/startup-debug.log
 * para ver en Administrador de archivos / SSH si Node llegó a ejecutarse.
 *
 * También escribe a stderr para que Hostinger capture el log aunque el
 * filesystem de .builds/ sea read-only.
 */
export function appendBootLog(line) {
  const text = typeof line === 'string' ? line : String(line);
  const entry = `${new Date().toISOString()} ${text}`;
  process.stderr.write(`[boot] ${entry}\n`);
  const candidates = [
    path.join(__dirname, '../../startup-debug.log'),
    path.join(process.cwd(), 'startup-debug.log'),
    '/tmp/elvive-startup-debug.log',
  ];
  for (const file of candidates) {
    try {
      fs.appendFileSync(file, `${entry}\n`);
      break;
    } catch {
      // sin permisos o ruta de solo lectura, probar siguiente
    }
  }
}
