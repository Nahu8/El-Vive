import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { saveFile, resolvePath } from '../lib/uploads.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type = req.query.type;
    const sql =
      'SELECT id, filename, originalName, path, type, size, created_at FROM media' +
      (type ? ' WHERE type = ?' : '') +
      ' ORDER BY created_at DESC';
    const rows = type ? await dbAll(sql, [type]) : await dbAll(sql);
    res.json(rows);
  })
);

router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
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
    const result = await dbRun('INSERT INTO media (filename, originalName, path, type, size) VALUES (?,?,?,?,?)', [
      name,
      req.file.originalname,
      rel,
      mediaType,
      req.file.size,
    ]);
    const row = await dbGet('SELECT * FROM media WHERE id=?', [result.lastInsertRowid]);
    const servePath = '/uploads/' + rel;
    res.status(201).json({
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      path: servePath,
      url: servePath,
      type: row.type,
      size: row.size,
    });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await dbGet('SELECT path FROM media WHERE id=?', [req.params.id]);
    if (row?.path) {
      const abs = resolvePath(row.path);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM media WHERE id=?', [req.params.id]);
    res.json({ message: 'Media eliminado' });
  })
);

export default router;
