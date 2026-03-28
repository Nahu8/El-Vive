import { Router } from 'express';
import { dbGet, dbRun, parseJson, stringifyJson } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

async function getMinistriesContent() {
  let row = await dbGet('SELECT * FROM ministries_content LIMIT 1');
  if (!row) {
    await dbRun('INSERT INTO ministries_content (id) VALUES (1)');
    row = await dbGet('SELECT * FROM ministries_content LIMIT 1');
  }
  return row;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const m = await getMinistriesContent();
    const heroLightIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'hero-light']);
    const heroDarkIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'hero-dark']);
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
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const m = await getMinistriesContent();
    const body = req.body || {};
    const fields = ['hero', 'ministries', 'statistics', 'process', 'testimonials', 'faqs', 'pageContent'];
    for (const f of fields) {
      if (body[f] !== undefined) {
        await dbRun(`UPDATE ministries_content SET ${f}=?, updated_at=datetime('now') WHERE id=?`, [stringifyJson(body[f]), m.id]);
      }
    }
    res.json(await dbGet('SELECT * FROM ministries_content WHERE id=?', [m.id]));
  })
);

const patchField = (field, bodyKey) =>
  asyncHandler(async (req, res) => {
    const m = await getMinistriesContent();
    await dbRun(`UPDATE ministries_content SET ${field}=?, updated_at=datetime('now') WHERE id=?`, [stringifyJson(req.body[bodyKey]), m.id]);
    res.json(await dbGet('SELECT * FROM ministries_content WHERE id=?', [m.id]));
  });

router.patch('/hero', patchField('hero', 'hero'));
router.patch('/ministries', patchField('ministries', 'ministries'));
router.patch('/process', patchField('process', 'process'));
router.patch('/testimonials', patchField('testimonials', 'testimonials'));
router.patch('/faqs', patchField('faqs', 'faqs'));
router.patch('/page-content', patchField('pageContent', 'pageContent'));

export default router;
