import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM ministry_items ORDER BY id').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, description, contact } = req.body || {};
  const db = getDb();
  const result = db.prepare('INSERT INTO ministry_items (name, description, contact) VALUES (?,?,?)').run(name ?? '', description ?? '', contact ?? '');
  const row = db.prepare('SELECT * FROM ministry_items WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, contact } = req.body || {};
  getDb().prepare('UPDATE ministry_items SET name=?, description=?, contact=?, updated_at=datetime(\'now\') WHERE id=?').run(name ?? '', description ?? '', contact ?? '', id);
  const row = getDb().prepare('SELECT * FROM ministry_items WHERE id=?').get(id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM ministry_items WHERE id=?').run(req.params.id);
  res.json({ message: 'Ministerio eliminado exitosamente' });
});

export default router;
