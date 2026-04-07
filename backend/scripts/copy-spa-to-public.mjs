/**
 * Copia el build del Angular (monorepo: frontend/ hermano de backend/)
 * desde frontend/dist/frontend/browser → backend/public/ (index.html en raíz).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
