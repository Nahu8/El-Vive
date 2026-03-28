import { Router } from 'express';
import { getDb, parseJson, stringifyJson } from '../db/index.js';

const router = Router();

function getContact() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  if (!row) {
    db.prepare(
      `INSERT INTO contacts (email, phone, address, city, socialMedia, schedules, departments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'elviveiglesia@gmail.com',
      '+54 (11) 503-621-41',
      'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
      'La Matanza, Buenos Aires, Argentina',
      stringifyJson({ facebook: '', instagram: '', youtube: '', whatsapp: '', tiktok: '', twitter: '' }),
      stringifyJson({ sunday: '10:00 AM - 12:00 PM', wednesday: '7:00 PM - 9:00 PM' }),
      stringifyJson([])
    );
    row = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  }
  return row;
}

router.get('/', (req, res) => {
  const c = getContact();
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
});

router.put('/', (req, res) => {
  const c = getContact();
  const body = req.body || {};
  const fields = ['email', 'phone', 'address', 'city', 'socialMedia', 'schedules', 'departments', 'mapEmbed', 'additionalInfo', 'pageContent'];
  const db = getDb();
  for (const f of fields) {
    if (body[f] !== undefined) {
      const val = typeof body[f] === 'object' ? stringifyJson(body[f]) : body[f];
      db.prepare(`UPDATE contacts SET ${f}=?, updated_at=datetime('now') WHERE id=?`).run(val, c.id);
    }
  }
  const updated = db.prepare('SELECT * FROM contacts WHERE id=?').get(c.id);
  res.json(updated);
});

router.patch('/basic', (req, res) => {
  const c = getContact();
  const { email, phone, address, city, mapEmbed } = req.body || {};
  getDb()
    .prepare('UPDATE contacts SET email=?, phone=?, address=?, city=?, mapEmbed=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(email ?? c.email, phone ?? c.phone, address ?? c.address, city ?? c.city, mapEmbed !== undefined ? mapEmbed : c.mapEmbed, c.id);
  res.json(getDb().prepare('SELECT * FROM contacts WHERE id=?').get(c.id));
});

router.patch('/social-media', (req, res) => {
  const c = getContact();
  const data = req.body.socialMedia ?? parseJson(c.socialMedia);
  getDb().prepare('UPDATE contacts SET socialMedia=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), c.id);
  res.json(getDb().prepare('SELECT * FROM contacts WHERE id=?').get(c.id));
});

router.patch('/schedules', (req, res) => {
  const c = getContact();
  const data = req.body.schedules ?? parseJson(c.schedules);
  getDb().prepare('UPDATE contacts SET schedules=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), c.id);
  res.json(getDb().prepare('SELECT * FROM contacts WHERE id=?').get(c.id));
});

router.patch('/departments', (req, res) => {
  const c = getContact();
  const data = req.body.departments ?? parseJson(c.departments);
  getDb().prepare('UPDATE contacts SET departments=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), c.id);
  res.json(getDb().prepare('SELECT * FROM contacts WHERE id=?').get(c.id));
});

router.patch('/page-content', (req, res) => {
  const c = getContact();
  const data = req.body.pageContent ?? parseJson(c.pageContent);
  getDb().prepare('UPDATE contacts SET pageContent=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), c.id);
  res.json(getDb().prepare('SELECT * FROM contacts WHERE id=?').get(c.id));
});

export default router;
