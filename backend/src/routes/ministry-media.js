import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

const ministryId = (req) => req.params.ministryId;

router.get(
  '/media',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const icons = await dbAll('SELECT id, mediaType, imageName FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    const photos = await dbAll(
      'SELECT id, imageName, sortOrder FROM ministry_media WHERE ministryId=? AND mediaType=? ORDER BY sortOrder',
      [mid, 'photo']
    );
    const cards = await dbAll('SELECT id, imageName FROM ministry_card_images WHERE ministryId=?', [mid]);
    const videos = await dbAll('SELECT id, videoName, sortOrder FROM ministry_videos WHERE ministryId=? ORDER BY sortOrder', [mid]);
    const hasPdf = await dbGet('SELECT 1 FROM ministry_pdfs WHERE ministryId=?', [mid]);
    res.json({
      icon: icons[0] || null,
      photos,
      cardImage: cards[0] || null,
      videos,
      pdfUrl: hasPdf ? `/api/ministry/${mid}/pdf` : null,
    });
  })
);

router.post(
  '/icon',
  upload.single('icon'),
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const existing = await dbGet('SELECT imagePath FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    if (existing?.imagePath) {
      const abs = resolvePath(existing.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    const ext = path.extname(req.file.originalname) || '.png';
    const rel = saveFile('ministry', `min-${mid}-icon${ext}`, req.file.buffer);
    await dbRun('INSERT INTO ministry_media (ministryId, mediaType, imagePath, imageMime, imageName) VALUES (?,?,?,?,?)', [
      mid,
      'icon',
      rel,
      req.file.mimetype,
      req.file.originalname,
    ]);
    res.json({ message: 'Ícono guardado', iconUrl: `/api/ministry/${mid}/icon`, imageName: req.file.originalname });
  })
);

router.get(
  '/icon',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay ícono' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/png', row.imageName);
  })
);

router.delete(
  '/icon',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'icon']);
    res.json({ message: 'Ícono eliminado' });
  })
);

router.post(
  '/photo',
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const max = await dbGet('SELECT MAX(sortOrder) as m FROM ministry_media WHERE ministryId=? AND mediaType=?', [mid, 'photo']);
    const sortOrder = (max?.m ?? -1) + 1;
    const ext = path.extname(req.file.originalname) || '.jpg';
    const rel = saveFile('ministry', `min-${mid}-photo-${Date.now()}${ext}`, req.file.buffer);
    const result = await dbRun(
      'INSERT INTO ministry_media (ministryId, mediaType, imagePath, imageMime, imageName, sortOrder) VALUES (?,?,?,?,?,?)',
      [mid, 'photo', rel, req.file.mimetype, req.file.originalname, sortOrder]
    );
    res.status(201).json({
      id: result.lastInsertRowid,
      url: `/api/ministry/${mid}/photo/${result.lastInsertRowid}`,
      name: req.file.originalname,
    });
  })
);

router.get(
  '/photo/:photoId',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?', [
      req.params.photoId,
      mid,
      'photo',
    ]);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay imagen' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
  })
);

router.delete(
  '/photo/:photoId',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?', [
      req.params.photoId,
      mid,
      'photo',
    ]);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_media WHERE id=? AND ministryId=? AND mediaType=?', [req.params.photoId, mid, 'photo']);
    res.json({ message: 'Foto eliminada' });
  })
);

router.post(
  '/card-image',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const existing = await dbAll('SELECT imagePath FROM ministry_card_images WHERE ministryId=?', [mid]);
    for (const r of existing) {
      if (r.imagePath) {
        const abs = resolvePath(r.imagePath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      }
    }
    await dbRun('DELETE FROM ministry_card_images WHERE ministryId=?', [mid]);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const rel = saveFile('ministry', `min-${mid}-card${ext}`, req.file.buffer);
    await dbRun('INSERT INTO ministry_card_images (ministryId, imagePath, imageMime, imageName) VALUES (?,?,?,?)', [
      mid,
      rel,
      req.file.mimetype,
      req.file.originalname,
    ]);
    res.json({ message: 'Imagen de card guardada', imageUrl: `/api/ministry/${mid}/card-image`, imageName: req.file.originalname });
  })
);

router.get(
  '/card-image',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM ministry_card_images WHERE ministryId=?', [mid]);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay imagen' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
  })
);

router.delete(
  '/card-image',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT imagePath FROM ministry_card_images WHERE ministryId=?', [mid]);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_card_images WHERE ministryId=?', [mid]);
    res.json({ message: 'Imagen eliminada' });
  })
);

router.post(
  '/video',
  upload.single('video'),
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó video' });
    if (!req.file.mimetype.startsWith('video/')) return res.status(400).json({ error: 'El archivo debe ser un video' });
    const max = await dbGet('SELECT MAX(sortOrder) as m FROM ministry_videos WHERE ministryId=?', [mid]);
    const sortOrder = (max?.m ?? -1) + 1;
    const ext = path.extname(req.file.originalname) || '.mp4';
    const rel = saveFile('ministry', `min-${mid}-video-${Date.now()}${ext}`, req.file.buffer);
    const result = await dbRun(
      'INSERT INTO ministry_videos (ministryId, videoPath, videoMime, videoName, sortOrder) VALUES (?,?,?,?,?)',
      [mid, rel, req.file.mimetype, req.file.originalname, sortOrder]
    );
    res.status(201).json({
      message: 'Video guardado',
      videoId: result.lastInsertRowid,
      videoUrl: `/api/ministry/${mid}/video/${result.lastInsertRowid}`,
      videoName: req.file.originalname,
    });
  })
);

router.get(
  '/video/:videoId',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT videoPath, videoMime, videoName FROM ministry_videos WHERE id=? AND ministryId=?', [
      req.params.videoId,
      mid,
    ]);
    if (!row?.videoPath) return res.status(404).json({ error: 'No hay video' });
    sendFile(res, resolvePath(row.videoPath), row.videoMime || 'video/mp4', row.videoName || 'video.mp4');
  })
);

router.delete(
  '/video/:videoId',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT videoPath FROM ministry_videos WHERE id=? AND ministryId=?', [req.params.videoId, mid]);
    if (row?.videoPath) {
      const abs = resolvePath(row.videoPath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_videos WHERE id=? AND ministryId=?', [req.params.videoId, mid]);
    res.json({ message: 'Video eliminado' });
  })
);

router.post(
  '/pdf',
  upload.single('pdf'),
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó PDF' });
    if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'El archivo debe ser PDF' });
    const existing = await dbGet('SELECT filePath FROM ministry_pdfs WHERE ministryId=?', [mid]);
    if (existing?.filePath) {
      const abs = resolvePath(existing.filePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_pdfs WHERE ministryId=?', [mid]);
    const ext = path.extname(req.file.originalname) || '.pdf';
    const rel = saveFile('ministry', `min-${mid}-doc${ext}`, req.file.buffer);
    await dbRun('INSERT INTO ministry_pdfs (ministryId, filePath, fileMime, fileName) VALUES (?,?,?,?)', [
      mid,
      rel,
      req.file.mimetype,
      req.file.originalname,
    ]);
    res.json({ message: 'PDF guardado', pdfUrl: `/api/ministry/${mid}/pdf`, fileName: req.file.originalname });
  })
);

router.get(
  '/pdf',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT filePath, fileMime, fileName FROM ministry_pdfs WHERE ministryId=?', [mid]);
    if (!row?.filePath) return res.status(404).json({ error: 'No hay PDF' });
    sendFile(res, resolvePath(row.filePath), row.fileMime || 'application/pdf', row.fileName || 'documento.pdf');
  })
);

router.delete(
  '/pdf',
  asyncHandler(async (req, res) => {
    const mid = ministryId(req);
    const row = await dbGet('SELECT filePath FROM ministry_pdfs WHERE ministryId=?', [mid]);
    if (row?.filePath) {
      const abs = resolvePath(row.filePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM ministry_pdfs WHERE ministryId=?', [mid]);
    res.json({ message: 'PDF eliminado' });
  })
);

export default router;
