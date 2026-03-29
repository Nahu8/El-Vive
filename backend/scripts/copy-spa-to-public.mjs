/**
 * Copia el output de ng build a backend/public.
 * Origen: backend/frontend/dist/frontend/browser
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const src = path.join(backendRoot, 'frontend/dist/frontend/browser');
const dest = path.join(backendRoot, 'public');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error('No existe', src);
  console.error('Ejecutá antes: cd frontend && npm run build');
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('SPA copiado a', dest);
