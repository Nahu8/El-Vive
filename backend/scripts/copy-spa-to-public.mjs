import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');
const distBrowser = path.join(repoRoot, 'frontend', 'dist', 'frontend', 'browser');
const publicDir = path.join(backendRoot, 'public');

if (!fs.existsSync(path.join(distBrowser, 'index.html'))) {
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

process.exit(0);
