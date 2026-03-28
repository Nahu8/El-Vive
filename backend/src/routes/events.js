import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM events ORDER BY date DESC, time DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { title, date, time, location, category, description } = req.body || {};
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO events (title, date, time, location, category, description) VALUES (?,?,?,?,?,?)'
  ).run(title ?? '', date ?? null, time ?? null, location ?? '', category ?? '', description ?? '');
  const row = db.prepare('SELECT * FROM events WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { title, date, time, location, category, description } = req.body || {};
  getDb()
    .prepare('UPDATE events SET title=?, date=?, time=?, location=?, category=?, description=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(title ?? '', date ?? null, time ?? null, location ?? '', category ?? '', description ?? '', id);
  const row = getDb().prepare('SELECT * FROM events WHERE id=?').get(id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  getDb().prepare('DELETE FROM events WHERE id=?').run(id);
  res.json({ message: 'Evento eliminado exitosamente' });
});

export default router;
