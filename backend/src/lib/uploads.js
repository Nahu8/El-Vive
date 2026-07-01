import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_UPLOADS_DIR = path.join(__dirname, '../../uploads');

function resolveUploadsDir() {
  if (process.env.UPLOADS_DIR) return path.resolve(process.env.UPLOADS_DIR);
  if (process.env.NODE_ENV === 'production') {
    // ponytail: fuera del checkout git; override con UPLOADS_DIR en Hostinger si hace falta
    return path.join(os.homedir(), 'elvive-uploads');
  }
  return LEGACY_UPLOADS_DIR;
}

let uploadsDir = resolveUploadsDir();

export function getUploadsDir() {
  return uploadsDir;
}

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

/** On first prod boot, rescue files still sitting in backend/uploads after a deploy. */
export function migrateLegacyUploadsIfNeeded() {
  uploadsDir = resolveUploadsDir();
  ensureDir(uploadsDir);
  const legacy = path.resolve(LEGACY_UPLOADS_DIR);
  const current = path.resolve(uploadsDir);
  if (legacy === current || !fs.existsSync(legacy)) return;
  const legacyEntries = fs.readdirSync(legacy);
  if (!legacyEntries.length) return;
  const currentEntries = fs.readdirSync(uploadsDir);
  if (currentEntries.length) return;
  copyDirRecursive(legacy, uploadsDir);
}

export function saveFile(subdir, name, buffer) {
  const dir = path.join(uploadsDir, subdir);
  ensureDir(dir);
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, buffer);
  return path.join(subdir, name).replace(/\\/g, '/');
}

export function resolvePath(relativePath) {
  if (!relativePath) return null;
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\))+/, '');
  return path.join(uploadsDir, normalized);
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
