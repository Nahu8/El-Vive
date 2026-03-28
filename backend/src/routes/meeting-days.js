import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb, parseJson, stringifyJson } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function getMeetingDays() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM meeting_days LIMIT 1').get();
  if (!row) {
    db.prepare('INSERT INTO meeting_days (id) VALUES (1)').run();
    row = db.prepare('SELECT * FROM meeting_days LIMIT 1').get();
  }
  return row;
}

function enrichEventsWithMedia(eventsObj) {
  if (!eventsObj?.events) return eventsObj;
  const db = getDb();
  eventsObj.events = eventsObj.events.map((e) => {
    const id = e.id ?? e.id;
    if (!id) return e;
    const icon = db.prepare('SELECT 1 FROM event_media WHERE eventId = ? AND mediaType = ?').get(String(id), 'icon');
    const bg = db.prepare('SELECT 1 FROM event_media WHERE eventId = ? AND mediaType = ?').get(String(id), 'background');
    if (icon) e.iconUrl = `/api/event/${id}/icon`;
    if (bg) e.backgroundUrl = `/api/event/${id}/background`;
    return e;
  });
  return eventsObj;
}

router.get('/', (req, res) => {
  const md = getMeetingDays();
  const db = getDb();
  let cal = parseJson(md.calendarEvents) || {};
  cal = enrichEventsWithMedia(cal);
  let upcoming = parseJson(md.upcomingEvents) || {};
  if (upcoming.events) upcoming = enrichEventsWithMedia(upcoming);

  const hasHeroImage = !!md.heroImagePath;
  const upcomingIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'upcoming-events');
  const calendarIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'calendar');
  const heroLightIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'hero-light');
  const heroDarkIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'hero-dark');

  res.json({
    id: md.id,
    sectionTitle: cal.sectionTitle ?? 'CALENDARIO DE EVENTOS',
    sectionSubtitle: cal.sectionSubtitle ?? '',
    hero: parseJson(md.hero) || null,
    hasHeroImage,
    heroImageName: md.heroImageName ?? '',
    heroImageUrl: hasHeroImage ? '/api/meeting-days/hero-image' : null,
    heroImageUrlLight: heroLightIcon ? '/api/section-icon/meeting-days/hero-light' : null,
    heroImageUrlDark: heroDarkIcon ? '/api/section-icon/meeting-days/hero-dark' : null,
    calendarEvents: cal,
    upcomingEvents: Object.keys(upcoming).length ? upcoming : null,
    upcomingEventsIconUrl: upcomingIcon ? '/api/section-icon/meeting-days/upcoming-events' : null,
    calendarIconUrl: calendarIcon ? '/api/section-icon/meeting-days/calendar' : null,
    eventCta: parseJson(md.eventCta),
    eventSettings: parseJson(md.eventSettings) ?? { showPastEvents: true, showEventCountdown: true, defaultEventColor: '#3b82f6', defaultEventDuration: '120', enableEventRegistration: true, emailNotifications: true, reminderDaysBefore: '1' },
    createdAt: md.created_at,
    updatedAt: md.updated_at,
  });
});

router.put('/', (req, res) => {
  const md = getMeetingDays();
  const body = { ...req.body };
  delete body.heroImagePath;
  const db = getDb();
  const fields = ['calendarEvents', 'recurringMeetings', 'hero', 'upcomingEvents', 'eventCta', 'eventSettings'];
  fields.forEach((f) => {
    if (body[f] !== undefined) {
      db.prepare(`UPDATE meeting_days SET ${f}=?, updated_at=datetime('now') WHERE id=?`).run(stringifyJson(body[f]), md.id);
    }
  });
  const updated = db.prepare('SELECT * FROM meeting_days WHERE id=?').get(md.id);
  res.json(updated);
});

router.patch('/hero', (req, res) => {
  const md = getMeetingDays();
  getDb().prepare('UPDATE meeting_days SET hero=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.hero), md.id);
  res.json({ success: true, hero: req.body.hero });
});

router.patch('/calendar-events', (req, res) => {
  const md = getMeetingDays();
  const data = req.body.calendarEvents ?? req.body;
  getDb().prepare('UPDATE meeting_days SET calendarEvents=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), md.id);
  const row = getDb().prepare('SELECT calendarEvents FROM meeting_days WHERE id=?').get(md.id);
  res.json({ success: true, calendarEvents: parseJson(row.calendarEvents) });
});

router.patch('/upcoming-events', (req, res) => {
  const md = getMeetingDays();
  const data = req.body.upcomingEvents ?? req.body;
  getDb().prepare('UPDATE meeting_days SET upcomingEvents=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), md.id);
  const row = getDb().prepare('SELECT upcomingEvents FROM meeting_days WHERE id=?').get(md.id);
  res.json({ success: true, upcomingEvents: parseJson(row.upcomingEvents) });
});

router.patch('/event-cta', (req, res) => {
  const md = getMeetingDays();
  getDb().prepare('UPDATE meeting_days SET eventCta=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(req.body.eventCta), md.id);
  const row = getDb().prepare('SELECT eventCta FROM meeting_days WHERE id=?').get(md.id);
  res.json({ success: true, eventCta: parseJson(row.eventCta) });
});

router.patch('/recurring-meetings', (req, res) => {
  const md = getMeetingDays();
  const data = req.body.recurringMeetings ?? parseJson(getMeetingDays().recurringMeetings);
  getDb().prepare('UPDATE meeting_days SET recurringMeetings=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), md.id);
  res.json(getDb().prepare('SELECT * FROM meeting_days WHERE id=?').get(md.id));
});

router.patch('/event-settings', (req, res) => {
  const md = getMeetingDays();
  const data = req.body.eventSettings ?? parseJson(getMeetingDays().eventSettings);
  getDb().prepare('UPDATE meeting_days SET eventSettings=?, updated_at=datetime(\'now\') WHERE id=?').run(stringifyJson(data), md.id);
  res.json({ message: 'Event settings actualizados' });
});

router.post('/hero-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
  const md = getMeetingDays();
  const ext = path.extname(req.file.originalname) || '.jpg';
  const rel = saveFile('meeting-days', `hero-${md.id}${ext}`, req.file.buffer);
  getDb().prepare('UPDATE meeting_days SET heroImagePath=?, heroImageMime=?, heroImageName=?, updated_at=datetime(\'now\') WHERE id=?').run(rel, req.file.mimetype, req.file.originalname, md.id);
  res.json({ message: 'Imagen guardada en la base de datos', heroImageName: req.file.originalname, heroImageUrl: '/api/meeting-days/hero-image' });
});

router.get('/hero-image', (req, res) => {
  const md = getMeetingDays();
  if (!md.heroImagePath) return res.status(404).json({ error: 'No hay imagen guardada' });
  sendFile(res, resolvePath(md.heroImagePath), md.heroImageMime || 'image/jpeg', md.heroImageName || 'hero.jpg');
});

router.delete('/hero-image', (req, res) => {
  const md = getMeetingDays();
  if (md.heroImagePath) {
    const abs = resolvePath(md.heroImagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  getDb().prepare('UPDATE meeting_days SET heroImagePath=NULL, heroImageMime=NULL, heroImageName=NULL, updated_at=datetime(\'now\') WHERE id=?').run(md.id);
  res.json({ message: 'Imagen eliminada' });
});

export default router;
