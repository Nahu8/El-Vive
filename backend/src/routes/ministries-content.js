import { Router } from 'express';
import { getDb, parseJson, stringifyJson } from '../db/index.js';

const router = Router();

function getMinistriesContent() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM ministries_content LIMIT 1').get();
  if (!row) {
    db.prepare('INSERT INTO ministries_content (id) VALUES (1)').run();
    row = db.prepare('SELECT * FROM ministries_content LIMIT 1').get();
  }
  return row;
}

router.get('/', (req, res) => {
  const m = getMinistriesContent();
  const db = getDb();
  const heroLightIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'hero-light');
  const heroDarkIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'hero-dark');
  res.json({
    id: m.id,
    hero: {
      ...(parseJson(m.hero) || {}),
      heroImageUrlLight: heroLightIcon ? '/api/section-icon/ministries/hero-light' : null,
      heroImageUrlDark: heroDarkIcon ? '/api/section-icon/ministries/hero-dark' : null,
    },
    ministries: parseJson(m.ministries),
    statistics: parseJson(m.statistics),
    process: parseJson(m.process),
    testimonials: parseJson(m.testimonials),
    faqs: parseJson(m.faqs),
    pageContent: parseJson(m.pageContent),
  });
});

router.put('/', (req, res) => {
  const m = getMinistriesContent();
  const body = req.body || {};
  const fields = ['hero', 'ministries', 'statistics', 'process', 'testimonials', 'faqs', 'pageContent'];
  const db = getDb();
  for (const f of fields) {
    if (body[f] !== undefined) {
      db.prepare(`UPDATE ministries_content SET ${f}=?, updated_at=datetime('now') WHERE id=?`).run(stringifyJson(body[f]), m.id);
    }
  }
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/hero', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET hero=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.hero), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/ministries', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET ministries=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.ministries), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/process', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET process=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.process), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/testimonials', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET testimonials=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.testimonials), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/faqs', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET faqs=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.faqs), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

router.patch('/page-content', (req, res) => {
  const m = getMinistriesContent();
  getDb().prepare('UPDATE ministries_content SET pageContent=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.pageContent), m.id);
  res.json(getDb().prepare('SELECT * FROM ministries_content WHERE id=?').get(m.id));
});

export default router;
