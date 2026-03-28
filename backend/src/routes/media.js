import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
  const type = req.query.type;
  let sql = 'SELECT id, filename, originalName, path, type, size, created_at FROM media ORDER BY created_at DESC';
  const rows = type ? getDb().prepare(sql + ' WHERE type = ?').all(type) : getDb().prepare(sql).all();
  res.json(rows);
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
  const mime = req.file.mimetype;
  let mediaType = 'image';
  let subdir = 'images';
  if (mime.startsWith('video/')) {
    mediaType = 'video';
    subdir = 'videos';
  }
  if (req.body.category === 'icon') {
    mediaType = 'icon';
    subdir = 'icons';
  }
  const ext = path.extname(req.file.originalname) || (mediaType === 'video' ? '.mp4' : '.jpg');
  const name = `file-${Date.now()}${ext}`;
  const rel = saveFile(subdir, name, req.file.buffer);
  const db = getDb();
  const result = db.prepare('INSERT INTO media (filename, originalName, path, type, size) VALUES (?,?,?,?,?)').run(name, req.file.originalname, rel, mediaType, req.file.size);
  const row = db.prepare('SELECT * FROM media WHERE id=?').get(result.lastInsertRowid);
  const servePath = '/uploads/' + rel;
  res.status(201).json({ id: row.id, filename: row.filename, originalName: row.originalName, path: servePath, url: servePath, type: row.type, size: row.size });
});

router.delete('/:id', (req, res) => {
  const row = getDb().prepare('SELECT path FROM media WHERE id=?').get(req.params.id);
  if (row?.path) {
    const abs = resolvePath(row.path);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM media WHERE id=?').run(req.params.id);
  res.json({ message: 'Media eliminado' });
});

export default router;
