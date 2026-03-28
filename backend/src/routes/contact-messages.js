import { Router } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, ministry } = req.body || {};
    const result = await dbRun(
      'INSERT INTO contact_messages (name, email, subject, message, ministry) VALUES (?,?,?,?,?)',
      [name ?? '', email ?? '', subject ?? '', message ?? '', ministry ?? null]
    );
    const row = await dbGet('SELECT * FROM contact_messages WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json({ message: 'Mensaje enviado exitosamente', contact: row });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await dbAll('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await dbGet('SELECT * FROM contact_messages WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await dbRun('DELETE FROM contact_messages WHERE id=?', [req.params.id]);
    res.json({ message: 'Mensaje eliminado exitosamente' });
  })
);

export default router;
