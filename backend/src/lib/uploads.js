import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function saveFile(subdir, name, buffer) {
  const dir = path.join(UPLOADS_DIR, subdir);
  ensureDir(dir);
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, buffer);
  return path.join(subdir, name).replace(/\\/g, '/');
}

export function resolvePath(relativePath) {
  if (!relativePath) return null;
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\))+/, '');
  return path.join(UPLOADS_DIR, normalized);
}

export function sendFile(res, absolutePath, mimeType, filename = 'file') {
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }
  const stat = fs.statSync(absolutePath);
  const etag = crypto.createHash('md5').update(`${stat.mtimeMs}-${stat.size}`).digest('hex');
  res.setHeader('Content-Type', mimeType || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('ETag', `"${etag}"`);
  if (filename) res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  if (reqMatchesEtag(res, etag)) return res.status(304).end();
  const stream = fs.createReadStream(absolutePath);
  stream.pipe(res);
}

function reqMatchesEtag(res, etag) {
  const req = res.req;
  if (!req?.headers?.['if-none-match']) return false;
  const incoming = String(req.headers['if-none-match']).replace(/"/g, '');
  return incoming === etag;
}

