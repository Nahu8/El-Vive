import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbRun } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';
import { upsertSectionIcon } from '../lib/section-icon-store.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  upload.single('icon'),
  asyncHandler(async (req, res) => {
    const { pageKey, sectionKey } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Debe ser una imagen' });
    const ext = path.extname(req.file.originalname) || '.png';
    const row = await dbGet('SELECT imagePath FROM section_icons WHERE page_key=? AND section_key=?', [pageKey, sectionKey]);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    const rel = saveFile('section-icons', `${pageKey}_${sectionKey}${ext}`, req.file.buffer);
    await upsertSectionIcon(pageKey, sectionKey, rel, req.file.mimetype, req.file.originalname);
    res.json({
      message: 'Ícono de sección guardado',
      iconUrl: `/api/section-icon/${pageKey}/${sectionKey}`,
    });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { pageKey, sectionKey } = req.params;
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM section_icons WHERE page_key=? AND section_key=?', [
      pageKey,
      sectionKey,
    ]);
    if (!row?.imagePath) return res.status(404).json({ error: 'No hay ícono' });
    const abs = resolvePath(row.imagePath);
    if (!abs || !fs.existsSync(abs)) {
      return res.status(404).json({ error: 'Archivo de ícono no encontrado en el servidor' });
    }
    sendFile(res, abs, row.imageMime || 'image/png', row.imageName);
  })
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const { pageKey, sectionKey } = req.params;
    const row = await dbGet('SELECT imagePath FROM section_icons WHERE page_key=? AND section_key=?', [pageKey, sectionKey]);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM section_icons WHERE page_key=? AND section_key=?', [pageKey, sectionKey]);
    res.json({ message: 'Ícono eliminado' });
  })
);

export default router;
