import { Router } from 'express';
import { getDb, parseJson, stringifyJson } from '../db/index.js';
import { enrichDonacionesPageContent } from '../lib/donaciones-page-defaults.js';

const router = Router();

function getPage(db, pageKey) {
  let row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get(pageKey);
  if (!row) {
    db.prepare('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)').run(pageKey, '{}');
    row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get(pageKey);
  }
  return row;
}

router.get('/:pageKey', (req, res) => {
  const db = getDb();
  const row = getPage(db, req.params.pageKey);
  let pageContent = parseJson(row.page_content) ?? {};
  if (req.params.pageKey === 'donaciones') {
    pageContent = enrichDonacionesPageContent(pageContent);
  }
  res.json({ pageKey: row.page_key, pageContent });
});

router.put('/:pageKey', (req, res) => {
  const db = getDb();
  getPage(db, req.params.pageKey);
  const content = req.body?.pageContent ?? {};
  db.prepare('UPDATE generic_pages SET page_content=?, updated_at=datetime(\'now\') WHERE page_key=?')
    .run(stringifyJson(content), req.params.pageKey);
  const row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get(req.params.pageKey);
  res.json({ pageKey: row.page_key, pageContent: parseJson(row.page_content) });
});

export default router;
