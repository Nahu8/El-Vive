import { Router } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await dbAll('SELECT * FROM ministry_items ORDER BY id');
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, contact } = req.body || {};
    const result = await dbRun('INSERT INTO ministry_items (name, description, contact) VALUES (?,?,?)', [
      name ?? '',
      description ?? '',
      contact ?? '',
    ]);
    const row = await dbGet('SELECT * FROM ministry_items WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json(row);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { name, description, contact } = req.body || {};
    await dbRun("UPDATE ministry_items SET name=?, description=?, contact=?, updated_at=datetime('now') WHERE id=?", [
      name ?? '',
      description ?? '',
      contact ?? '',
      id,
    ]);
    const row = await dbGet('SELECT * FROM ministry_items WHERE id=?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await dbRun('DELETE FROM ministry_items WHERE id=?', [req.params.id]);
    res.json({ message: 'Ministerio eliminado exitosamente' });
  })
);

export default router;
