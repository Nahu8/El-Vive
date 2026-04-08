import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Hostinger a veces no muestra registros de runtime; esto escribe en backend/startup-debug.log
 * para ver en Administrador de archivos / SSH si Node llegó a ejecutarse.
 */
export function appendBootLog(line) {
  try {
    const file = path.join(__dirname, '../../startup-debug.log');
    const text = typeof line === 'string' ? line : String(line);
    fs.appendFileSync(file, `${new Date().toISOString()} ${text}\n`);
  } catch {
    // sin permisos o ruta de solo lectura
  }
}
