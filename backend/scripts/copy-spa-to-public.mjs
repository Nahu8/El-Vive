/**
<<<<<<< Updated upstream
 * Copia el output de ng build a backend/public (útil si en Hostinger solo subís la carpeta backend).
 * Origen: ../frontend/dist/frontend/browser (proyecto Angular "frontend", builder application).
=======
 * Copia el build del Angular (monorepo: frontend/ al mismo nivel que backend/)
 * desde frontend/dist/frontend/browser → backend/public/ (index.html en raíz).
>>>>>>> Stashed changes
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
<<<<<<< Updated upstream
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
=======
const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');
const distBrowser = path.join(repoRoot, 'frontend', 'dist', 'frontend', 'browser');
const publicDir = path.join(backendRoot, 'public');

if (!fs.existsSync(path.join(distBrowser, 'index.html'))) {
  console.error('copy:spa: no existe', path.join(distBrowser, 'index.html'));
  console.error('Ejecutá antes: npm run build:frontend (desde backend) o ng build en frontend/');
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });

const keepInPublic = new Set(['.gitkeep']);
for (const name of fs.readdirSync(publicDir)) {
  if (keepInPublic.has(name)) continue;
  fs.rmSync(path.join(publicDir, name), { recursive: true, force: true });
}

for (const name of fs.readdirSync(distBrowser)) {
  fs.cpSync(path.join(distBrowser, name), path.join(publicDir, name), { recursive: true });
}

console.log('copy:spa: frontend/dist/frontend/browser → backend/public/');
>>>>>>> Stashed changes
