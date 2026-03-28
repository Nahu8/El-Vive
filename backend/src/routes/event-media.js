import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbRun } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/icon',
  upload.single('icon'),
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Debe ser una imagen' });
    await dbRun('DELETE FROM event_media WHERE eventId = ? AND mediaType = ?', [eventId, 'icon']);
    const ext = path.extname(req.file.originalname) || '.png';
    const rel = saveFile('event-media', `event-${eventId}-icon${ext}`, req.file.buffer);
    await dbRun('INSERT INTO event_media (eventId, mediaType, imagePath, imageMime, imageName) VALUES (?,?,?,?,?)', [
      eventId,
      'icon',
      rel,
      req.file.mimetype,
      req.file.originalname,
    ]);
    res.json({ message: 'Ícono subido' });
  })
);

router.get(
  '/icon',
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'icon']);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay ícono' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/png', row.imageName);
  })
);

router.delete(
  '/icon',
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    const row = await dbGet('SELECT imagePath FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'icon']);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'icon']);
    res.json({ message: 'Ícono eliminado' });
  })
);

router.post(
  '/background',
  upload.single('background'),
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Debe ser una imagen' });
    await dbRun('DELETE FROM event_media WHERE eventId = ? AND mediaType = ?', [eventId, 'background']);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const rel = saveFile('event-media', `event-${eventId}-bg${ext}`, req.file.buffer);
    await dbRun('INSERT INTO event_media (eventId, mediaType, imagePath, imageMime, imageName) VALUES (?,?,?,?,?)', [
      eventId,
      'background',
      rel,
      req.file.mimetype,
      req.file.originalname,
    ]);
    res.json({ message: 'Fondo subido' });
  })
);

router.get(
  '/background',
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'background']);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay imagen' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
  })
);

router.delete(
  '/background',
  asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;
    const row = await dbGet('SELECT imagePath FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'background']);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM event_media WHERE eventId=? AND mediaType=?', [eventId, 'background']);
    res.json({ message: 'Fondo eliminado' });
  })
);

export default router;
