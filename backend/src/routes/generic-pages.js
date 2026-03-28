import { Router } from 'express';
import { dbGet, dbRun, parseJson, stringifyJson } from '../db/index.js';
import { enrichDonacionesPageContent } from '../lib/donaciones-page-defaults.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

async function getPage(pageKey) {
  let row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', [pageKey]);
  if (!row) {
    await dbRun('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)', [pageKey, '{}']);
    row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', [pageKey]);
  }
  return row;
}

router.get(
  '/:pageKey',
  asyncHandler(async (req, res) => {
    const row = await getPage(req.params.pageKey);
    let pageContent = parseJson(row.page_content) ?? {};
    if (req.params.pageKey === 'donaciones') {
      pageContent = enrichDonacionesPageContent(pageContent);
    }
    res.json({ pageKey: row.page_key, pageContent });
  })
);

router.put(
  '/:pageKey',
  asyncHandler(async (req, res) => {
    await getPage(req.params.pageKey);
    const content = req.body?.pageContent ?? {};
    await dbRun("UPDATE generic_pages SET page_content=?, updated_at=datetime('now') WHERE page_key=?", [
      stringifyJson(content),
      req.params.pageKey,
    ]);
    const row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', [req.params.pageKey]);
    res.json({ pageKey: row.page_key, pageContent: parseJson(row.page_content) });
  })
);

export default router;
