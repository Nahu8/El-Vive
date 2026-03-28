import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('icon'), (req, res) => {
  const { pageKey, sectionKey } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Debe ser una imagen' });
  const ext = path.extname(req.file.originalname) || '.png';
  const rel = saveFile('section-icons', `${pageKey}_${sectionKey}${ext}`, req.file.buffer);
  const db = getDb();
  db.prepare(
    'INSERT INTO section_icons (page_key, section_key, imagePath, imageMime, imageName) VALUES (?,?,?,?,?) ON CONFLICT(page_key, section_key) DO UPDATE SET imagePath=excluded.imagePath, imageMime=excluded.imageMime, imageName=excluded.imageName, updated_at=datetime(\'now\')'
  ).run(pageKey, sectionKey, rel, req.file.mimetype, req.file.originalname);
  res.json({ message: 'Ícono de sección guardado' });
});

router.get('/', (req, res) => {
  const { pageKey, sectionKey } = req.params;
  const row = getDb().prepare('SELECT imagePath, imageMime, imageName FROM section_icons WHERE page_key=? AND section_key=?').get(pageKey, sectionKey);
  if (!row?.imagePath) return res.status(404).json({ error: 'No hay ícono' });
  sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/png', row.imageName);
});

router.delete('/', (req, res) => {
  const { pageKey, sectionKey } = req.params;
  const row = getDb().prepare('SELECT imagePath FROM section_icons WHERE page_key=? AND section_key=?').get(pageKey, sectionKey);
  if (row?.imagePath) {
    const abs = resolvePath(row.imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM section_icons WHERE page_key=? AND section_key=?').run(pageKey, sectionKey);
  res.json({ message: 'Ícono eliminado' });
});

export default router;
