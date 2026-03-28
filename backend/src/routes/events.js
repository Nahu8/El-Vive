import { Router } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await dbAll('SELECT * FROM events ORDER BY date DESC, time DESC');
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, date, time, location, category, description } = req.body || {};
    const result = await dbRun(
      'INSERT INTO events (title, date, time, location, category, description) VALUES (?,?,?,?,?,?)',
      [title ?? '', date ?? null, time ?? null, location ?? '', category ?? '', description ?? '']
    );
    const row = await dbGet('SELECT * FROM events WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json(row);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title, date, time, location, category, description } = req.body || {};
    await dbRun("UPDATE events SET title=?, date=?, time=?, location=?, category=?, description=?, updated_at=datetime('now') WHERE id=?", [
      title ?? '',
      date ?? null,
      time ?? null,
      location ?? '',
      category ?? '',
      description ?? '',
      id,
    ]);
    const row = await dbGet('SELECT * FROM events WHERE id=?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    await dbRun('DELETE FROM events WHERE id=?', [id]);
    res.json({ message: 'Evento eliminado exitosamente' });
  })
);

export default router;
