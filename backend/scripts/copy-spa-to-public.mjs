/**
 * Copia el output de ng build a backend/public (útil si en Hostinger solo subís la carpeta backend).
 * Origen: ../frontend/dist/frontend/browser (proyecto Angular "frontend", builder application).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');
const src = path.join(root, 'frontend/dist/frontend/browser');
const dest = path.join(root, 'backend/public');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error('No existe', src);
  console.error('Ejecutá antes: cd frontend && npm run build');
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('SPA copiado a', dest);
