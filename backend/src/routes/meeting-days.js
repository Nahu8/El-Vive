import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbRun, parseJson, stringifyJson } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function getMeetingDays() {
  let row = await dbGet('SELECT * FROM meeting_days LIMIT 1');
  if (!row) {
    await dbRun('INSERT INTO meeting_days (id) VALUES (1)');
    row = await dbGet('SELECT * FROM meeting_days LIMIT 1');
  }
  return row;
}

async function enrichEventsWithMedia(eventsObj) {
  if (!eventsObj?.events) return eventsObj;
  const events = await Promise.all(
    eventsObj.events.map(async (e) => {
      const id = e.id;
      if (!id) return e;
      const icon = await dbGet('SELECT 1 FROM event_media WHERE eventId = ? AND mediaType = ?', [String(id), 'icon']);
      const bg = await dbGet('SELECT 1 FROM event_media WHERE eventId = ? AND mediaType = ?', [String(id), 'background']);
      const out = { ...e };
      if (icon) out.iconUrl = `/api/event/${id}/icon`;
      if (bg) out.backgroundUrl = `/api/event/${id}/background`;
      return out;
    })
  );
  return { ...eventsObj, events };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    let cal = parseJson(md.calendarEvents) || {};
    cal = await enrichEventsWithMedia(cal);
    let upcoming = parseJson(md.upcomingEvents) || {};
    if (upcoming.events) upcoming = await enrichEventsWithMedia(upcoming);

    const hasHeroImage = !!md.heroImagePath;
    const upcomingIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', [
      'meeting-days',
      'upcoming-events',
    ]);
    const calendarIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['meeting-days', 'calendar']);
    const heroLightIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['meeting-days', 'hero-light']);
    const heroDarkIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['meeting-days', 'hero-dark']);

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
      eventSettings:
        parseJson(md.eventSettings) ?? {
          showPastEvents: true,
          showEventCountdown: true,
          defaultEventColor: '#3b82f6',
          defaultEventDuration: '120',
          enableEventRegistration: true,
          emailNotifications: true,
          reminderDaysBefore: '1',
        },
      createdAt: md.created_at,
      updatedAt: md.updated_at,
    });
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    const body = { ...req.body };
    delete body.heroImagePath;
    const fields = ['calendarEvents', 'recurringMeetings', 'hero', 'upcomingEvents', 'eventCta', 'eventSettings'];
    for (const f of fields) {
      if (body[f] !== undefined) {
        await dbRun(`UPDATE meeting_days SET ${f}=?, updated_at=datetime('now') WHERE id=?`, [stringifyJson(body[f]), md.id]);
      }
    }
    const updated = await dbGet('SELECT * FROM meeting_days WHERE id=?', [md.id]);
    res.json(updated);
  })
);

router.patch(
  '/hero',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    await dbRun("UPDATE meeting_days SET hero=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(req.body.hero), md.id]);
    res.json({ success: true, hero: req.body.hero });
  })
);

router.patch(
  '/calendar-events',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    const data = req.body.calendarEvents ?? req.body;
    await dbRun("UPDATE meeting_days SET calendarEvents=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), md.id]);
    const row = await dbGet('SELECT calendarEvents FROM meeting_days WHERE id=?', [md.id]);
    res.json({ success: true, calendarEvents: parseJson(row.calendarEvents) });
  })
);

router.patch(
  '/upcoming-events',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    const data = req.body.upcomingEvents ?? req.body;
    await dbRun("UPDATE meeting_days SET upcomingEvents=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), md.id]);
    const row = await dbGet('SELECT upcomingEvents FROM meeting_days WHERE id=?', [md.id]);
    res.json({ success: true, upcomingEvents: parseJson(row.upcomingEvents) });
  })
);

router.patch(
  '/event-cta',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    await dbRun("UPDATE meeting_days SET eventCta=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(req.body.eventCta), md.id]);
    const row = await dbGet('SELECT eventCta FROM meeting_days WHERE id=?', [md.id]);
    res.json({ success: true, eventCta: parseJson(row.eventCta) });
  })
);

router.patch(
  '/recurring-meetings',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    const data = req.body.recurringMeetings ?? parseJson(md.recurringMeetings);
    await dbRun("UPDATE meeting_days SET recurringMeetings=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), md.id]);
    res.json(await dbGet('SELECT * FROM meeting_days WHERE id=?', [md.id]));
  })
);

router.patch(
  '/event-settings',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    const data = req.body.eventSettings ?? parseJson(md.eventSettings);
    await dbRun("UPDATE meeting_days SET eventSettings=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), md.id]);
    res.json({ message: 'Event settings actualizados' });
  })
);

router.post(
  '/hero-image',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const md = await getMeetingDays();
    const ext = path.extname(req.file.originalname) || '.jpg';
    const rel = saveFile('meeting-days', `hero-${md.id}${ext}`, req.file.buffer);
    await dbRun("UPDATE meeting_days SET heroImagePath=?, heroImageMime=?, heroImageName=?, updated_at=datetime('now') WHERE id=?", [
      rel,
      req.file.mimetype,
      req.file.originalname,
      md.id,
    ]);
    res.json({
      message: 'Imagen guardada en la base de datos',
      heroImageName: req.file.originalname,
      heroImageUrl: '/api/meeting-days/hero-image',
    });
  })
);

router.get(
  '/hero-image',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    if (!md.heroImagePath) return res.status(404).json({ error: 'No hay imagen guardada' });
    sendFile(res, resolvePath(md.heroImagePath), md.heroImageMime || 'image/jpeg', md.heroImageName || 'hero.jpg');
  })
);

router.delete(
  '/hero-image',
  asyncHandler(async (req, res) => {
    const md = await getMeetingDays();
    if (md.heroImagePath) {
      const abs = resolvePath(md.heroImagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun("UPDATE meeting_days SET heroImagePath=NULL, heroImageMime=NULL, heroImageName=NULL, updated_at=datetime('now') WHERE id=?", [
      md.id,
    ]);
    res.json({ message: 'Imagen eliminada' });
  })
);

export default router;
