import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Guarda un buffer en uploads/subdir/name y devuelve la ruta relativa (subdir/name).
 */
export function saveFile(subdir, name, buffer) {
  const dir = path.join(UPLOADS_DIR, subdir);
  ensureDir(dir);
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, buffer);
  return path.join(subdir, name).replace(/\\/g, '/');
}

/**
 * Devuelve la ruta absoluta del archivo. relativePath es relativo a uploads/.
 */
export function resolvePath(relativePath) {
  if (!relativePath) return null;
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\))+/, '');
  return path.join(UPLOADS_DIR, normalized);
}

/**
 * Envía un archivo como respuesta con Content-Type y Cache-Control.
 */
export function sendFile(res, absolutePath, mimeType, filename = 'file') {
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }
  res.setHeader('Content-Type', mimeType || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  if (filename) res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const stream = fs.createReadStream(absolutePath);
  stream.pipe(res);
}
