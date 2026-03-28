import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, email, subject, message, ministry } = req.body || {};
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO contact_messages (name, email, subject, message, ministry) VALUES (?,?,?,?,?)'
  ).run(name ?? '', email ?? '', subject ?? '', message ?? '', ministry ?? null);
  const row = db.prepare('SELECT * FROM contact_messages WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Mensaje enviado exitosamente', contact: row });
});

router.get('/', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = getDb().prepare('SELECT * FROM contact_messages WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM contact_messages WHERE id=?').run(req.params.id);
  res.json({ message: 'Mensaje eliminado exitosamente' });
});

export default router;
