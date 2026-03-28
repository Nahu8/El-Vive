import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

const ministryId = (req) => req.params.ministryId;

// GET /api/ministry/:ministryId/media
router.get('/media', (req, res) => {
  const mid = ministryId(req);
  const icons = getDb().prepare('SELECT id, mediaType, imageName FROM ministry_media WHERE ministryId=? AND mediaType=?').all(mid, 'icon');
  const photos = getDb().prepare('SELECT id, imageName, sortOrder FROM ministry_media WHERE ministryId=? AND mediaType=? ORDER BY sortOrder').all(mid, 'photo');
  const cards = getDb().prepare('SELECT id, imageName FROM ministry_card_images WHERE ministryId=?').all(mid);
  const videos = getDb().prepare('SELECT id, videoName, sortOrder FROM ministry_videos WHERE ministryId=? ORDER BY sortOrder').all(mid);
  const hasPdf = getDb().prepare('SELECT 1 FROM ministry_pdfs WHERE ministryId=?').get(mid);
  res.json({
    icon: icons[0] || null,
    photos,
    cardImage: cards[0] || null,
    videos,
    pdfUrl: hasPdf ? `/api/ministry/${mid}/pdf` : null
  });
});

// --- Icon ---
router.post('/icon', upload.single('icon'), (req, res) => {
  const mid = ministryId(req);
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
  const db = getDb();
  const existing = db.prepare('SELECT imagePath FROM ministry_media WHERE ministryId=? AND mediaType=?').get(mid, 'icon');
  if (existing?.imagePath) {
    const abs = resolvePath(existing.imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  db.prepare('DELETE FROM ministry_media WHERE ministryId=? AND mediaType=?').run(mid, 'icon');
  const ext = path.extname(req.file.originalname) || '.png';
  const rel = saveFile('ministry', `min-${mid}-icon${ext}`, req.file.buffer);
  db.prepare('INSERT INTO ministry_media (ministryId, mediaType, imagePath, imageMime, imageName) VALUES (?,?,?,?,?)').run(mid, 'icon', rel, req.file.mimetype, req.file.originalname);
  res.json({ message: 'Ícono guardado', iconUrl: `/api/ministry/${mid}/icon`, imageName: req.file.originalname });
});

router.get('/icon', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath, imageMime, imageName FROM ministry_media WHERE ministryId=? AND mediaType=?').get(mid, 'icon');
  if (!row?.imagePath) return res.status(404).json({ error: 'No hay ícono' });
  sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/png', row.imageName);
});

router.delete('/icon', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath FROM ministry_media WHERE ministryId=? AND mediaType=?').get(mid, 'icon');
  if (row?.imagePath) {
    const abs = resolvePath(row.imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM ministry_media WHERE ministryId=? AND mediaType=?').run(mid, 'icon');
  res.json({ message: 'Ícono eliminado' });
});

// --- Photo ---
router.post('/photo', upload.single('photo'), (req, res) => {
  const mid = ministryId(req);
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
  const db = getDb();
  const max = db.prepare('SELECT MAX(sortOrder) as m FROM ministry_media WHERE ministryId=? AND mediaType=?').get(mid, 'photo');
  const sortOrder = (max?.m ?? -1) + 1;
  const ext = path.extname(req.file.originalname) || '.jpg';
  const rel = saveFile('ministry', `min-${mid}-photo-${Date.now()}${ext}`, req.file.buffer);
  const result = db.prepare('INSERT INTO ministry_media (ministryId, mediaType, imagePath, imageMime, imageName, sortOrder) VALUES (?,?,?,?,?,?)').run(mid, 'photo', rel, req.file.mimetype, req.file.originalname, sortOrder);
  res.status(201).json({ id: result.lastInsertRowid, url: `/api/ministry/${mid}/photo/${result.lastInsertRowid}`, name: req.file.originalname });
});

router.get('/photo/:photoId', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath, imageMime, imageName FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?').get(req.params.photoId, mid, 'photo');
  if (!row?.imagePath) return res.status(404).json({ error: 'No hay imagen' });
  sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
});

router.delete('/photo/:photoId', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?').get(req.params.photoId, mid, 'photo');
  if (row?.imagePath) {
    const abs = resolvePath(row.imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?').run(req.params.photoId, mid, 'photo');
  res.json({ message: 'Foto eliminada' });
});

// --- Card image ---
router.post('/card-image', upload.single('image'), (req, res) => {
  const mid = ministryId(req);
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
  const db = getDb();
  const existing = db.prepare('SELECT imagePath FROM ministry_card_images WHERE ministryId=?').all(mid);
  existing.forEach((r) => {
    if (r.imagePath) {
      const abs = resolvePath(r.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
  });
  db.prepare('DELETE FROM ministry_card_images WHERE ministryId=?').run(mid);
  const ext = path.extname(req.file.originalname) || '.jpg';
  const rel = saveFile('ministry', `min-${mid}-card${ext}`, req.file.buffer);
  db.prepare('INSERT INTO ministry_card_images (ministryId, imagePath, imageMime, imageName) VALUES (?,?,?,?)').run(mid, rel, req.file.mimetype, req.file.originalname);
  res.json({ message: 'Imagen de card guardada', imageUrl: `/api/ministry/${mid}/card-image`, imageName: req.file.originalname });
});

router.get('/card-image', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath, imageMime, imageName FROM ministry_card_images WHERE ministryId=?').get(mid);
  if (!row?.imagePath) return res.status(404).json({ error: 'No hay imagen' });
  sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
});

router.delete('/card-image', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT imagePath FROM ministry_card_images WHERE ministryId=?').get(mid);
  if (row?.imagePath) {
    const abs = resolvePath(row.imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM ministry_card_images WHERE ministryId=?').run(mid);
  res.json({ message: 'Imagen eliminada' });
});

// --- Video ---
router.post('/video', upload.single('video'), (req, res) => {
  const mid = ministryId(req);
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó video' });
  if (!req.file.mimetype.startsWith('video/')) return res.status(400).json({ error: 'El archivo debe ser un video' });
  const db = getDb();
  const max = db.prepare('SELECT MAX(sortOrder) as m FROM ministry_videos WHERE ministryId=?').get(mid);
  const sortOrder = (max?.m ?? -1) + 1;
  const ext = path.extname(req.file.originalname) || '.mp4';
  const rel = saveFile('ministry', `min-${mid}-video-${Date.now()}${ext}`, req.file.buffer);
  const result = db.prepare('INSERT INTO ministry_videos (ministryId, videoPath, videoMime, videoName, sortOrder) VALUES (?,?,?,?,?)').run(mid, rel, req.file.mimetype, req.file.originalname, sortOrder);
  res.status(201).json({ message: 'Video guardado', videoId: result.lastInsertRowid, videoUrl: `/api/ministry/${mid}/video/${result.lastInsertRowid}`, videoName: req.file.originalname });
});

router.get('/video/:videoId', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT videoPath, videoMime, videoName FROM ministry_videos WHERE id=? AND ministryId=?').get(req.params.videoId, mid);
  if (!row?.videoPath) return res.status(404).json({ error: 'No hay video' });
  sendFile(res, resolvePath(row.videoPath), row.videoMime || 'video/mp4', row.videoName || 'video.mp4');
});

router.delete('/video/:videoId', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT videoPath FROM ministry_videos WHERE id=? AND ministryId=?').get(req.params.videoId, mid);
  if (row?.videoPath) {
    const abs = resolvePath(row.videoPath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM ministry_videos WHERE id=? AND ministryId=?').run(req.params.videoId, mid);
  res.json({ message: 'Video eliminado' });
});

// --- PDF (opcional por ministerio) ---
router.post('/pdf', upload.single('pdf'), (req, res) => {
  const mid = ministryId(req);
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó PDF' });
  if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'El archivo debe ser PDF' });
  const db = getDb();
  const existing = db.prepare('SELECT filePath FROM ministry_pdfs WHERE ministryId=?').get(mid);
  if (existing?.filePath) {
    const abs = resolvePath(existing.filePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  db.prepare('DELETE FROM ministry_pdfs WHERE ministryId=?').run(mid);
  const ext = path.extname(req.file.originalname) || '.pdf';
  const rel = saveFile('ministry', `min-${mid}-doc${ext}`, req.file.buffer);
  db.prepare('INSERT INTO ministry_pdfs (ministryId, filePath, fileMime, fileName) VALUES (?,?,?,?)')
    .run(mid, rel, req.file.mimetype, req.file.originalname);
  res.json({ message: 'PDF guardado', pdfUrl: `/api/ministry/${mid}/pdf`, fileName: req.file.originalname });
});

router.get('/pdf', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT filePath, fileMime, fileName FROM ministry_pdfs WHERE ministryId=?').get(mid);
  if (!row?.filePath) return res.status(404).json({ error: 'No hay PDF' });
  sendFile(res, resolvePath(row.filePath), row.fileMime || 'application/pdf', row.fileName || 'documento.pdf');
});

router.delete('/pdf', (req, res) => {
  const mid = ministryId(req);
  const row = getDb().prepare('SELECT filePath FROM ministry_pdfs WHERE ministryId=?').get(mid);
  if (row?.filePath) {
    const abs = resolvePath(row.filePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM ministry_pdfs WHERE ministryId=?').run(mid);
  res.json({ message: 'PDF eliminado' });
});

export default router;
