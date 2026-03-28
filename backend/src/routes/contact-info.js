import { Router } from 'express';
import { dbGet, dbRun, parseJson, stringifyJson } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

async function getContact() {
  let row = await dbGet('SELECT * FROM contacts LIMIT 1');
  if (!row) {
    await dbRun(
      `INSERT INTO contacts (email, phone, address, city, socialMedia, schedules, departments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'elviveiglesia@gmail.com',
        '+54 (11) 503-621-41',
        'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
        'La Matanza, Buenos Aires, Argentina',
        stringifyJson({ facebook: '', instagram: '', youtube: '', whatsapp: '', tiktok: '', twitter: '' }),
        stringifyJson({ sunday: '10:00 AM - 12:00 PM', wednesday: '7:00 PM - 9:00 PM' }),
        stringifyJson([]),
      ]
    );
    row = await dbGet('SELECT * FROM contacts LIMIT 1');
  }
  return row;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    res.json({
      id: c.id,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      socialMedia: parseJson(c.socialMedia) ?? [],
      schedules: parseJson(c.schedules) ?? [],
      departments: parseJson(c.departments) ?? [],
      mapEmbed: c.mapEmbed ?? '',
      additionalInfo: c.additionalInfo ?? '',
      pageContent: parseJson(c.pageContent) ?? [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    });
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const body = req.body || {};
    const fields = ['email', 'phone', 'address', 'city', 'socialMedia', 'schedules', 'departments', 'mapEmbed', 'additionalInfo', 'pageContent'];
    for (const f of fields) {
      if (body[f] !== undefined) {
        const val = typeof body[f] === 'object' ? stringifyJson(body[f]) : body[f];
        await dbRun(`UPDATE contacts SET ${f}=?, updated_at=datetime('now') WHERE id=?`, [val, c.id]);
      }
    }
    const updated = await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]);
    res.json(updated);
  })
);

router.patch(
  '/basic',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const { email, phone, address, city, mapEmbed } = req.body || {};
    await dbRun("UPDATE contacts SET email=?, phone=?, address=?, city=?, mapEmbed=?, updated_at=datetime('now') WHERE id=?", [
      email ?? c.email,
      phone ?? c.phone,
      address ?? c.address,
      city ?? c.city,
      mapEmbed !== undefined ? mapEmbed : c.mapEmbed,
      c.id,
    ]);
    res.json(await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]));
  })
);

router.patch(
  '/social-media',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const data = req.body.socialMedia ?? parseJson(c.socialMedia);
    await dbRun("UPDATE contacts SET socialMedia=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), c.id]);
    res.json(await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]));
  })
);

router.patch(
  '/schedules',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const data = req.body.schedules ?? parseJson(c.schedules);
    await dbRun("UPDATE contacts SET schedules=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), c.id]);
    res.json(await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]));
  })
);

router.patch(
  '/departments',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const data = req.body.departments ?? parseJson(c.departments);
    await dbRun("UPDATE contacts SET departments=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), c.id]);
    res.json(await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]));
  })
);

router.patch(
  '/page-content',
  asyncHandler(async (req, res) => {
    const c = await getContact();
    const data = req.body.pageContent ?? parseJson(c.pageContent);
    await dbRun("UPDATE contacts SET pageContent=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), c.id]);
    res.json(await dbGet('SELECT * FROM contacts WHERE id=?', [c.id]));
  })
);

export default router;
