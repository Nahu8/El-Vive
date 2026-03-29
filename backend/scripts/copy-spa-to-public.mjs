/**
 * Tras `ng build` (outputPath ../public) puede quedar:
 * - `public/browser/` (application builder) → subimos todo a `public/` y borramos `browser/`
 * - `public/index.html` ya en la raíz → no hace falta copiar
 *
 * No borrar `public/browser` antes de leerla (error típico al limpiar todo `public/`).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const browserDir = path.join(backendRoot, 'public', 'browser');
const publicDir = path.join(backendRoot, 'public');
const indexAtRoot = path.join(publicDir, 'index.html');
const indexInBrowser = path.join(browserDir, 'index.html');

if (fs.existsSync(indexAtRoot) && !fs.existsSync(indexInBrowser)) {
  console.log('copy:spa: index.html ya está en public/, sin carpeta browser — omitido.');
  process.exit(0);
}

if (!fs.existsSync(indexInBrowser)) {
  console.error('copy:spa: no existe', indexInBrowser);
  console.error('Ejecutá antes: npm run build:frontend');
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });

const keepInPublic = new Set(['.gitkeep', 'browser']);
for (const name of fs.readdirSync(publicDir)) {
  if (keepInPublic.has(name)) continue;
  fs.rmSync(path.join(publicDir, name), { recursive: true, force: true });
}

for (const name of fs.readdirSync(browserDir)) {
  fs.cpSync(path.join(browserDir, name), path.join(publicDir, name), { recursive: true });
}

fs.rmSync(browserDir, { recursive: true, force: true });
console.log('copy:spa: contenido de public/browser copiado a public/ (index.html en raíz)');
