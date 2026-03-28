import { Router } from 'express';
import { getDb, parseJson } from '../db/index.js';
import { isMiercolesTheme } from '../lib/argentina-time.js';
import { enrichDonacionesPageContent } from '../lib/donaciones-page-defaults.js';

const router = Router();

function getHome() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM homes LIMIT 1').get();
  if (!row) {
    db.prepare(
      `INSERT INTO homes (heroTitle, heroButton1Text, heroButton1Link, heroButton2Text, heroButton2Link) VALUES (?,?,?,?,?)`
    ).run('ÉL VIVE IGLESIA', 'VER EVENTOS', '/dias-reunion', 'CONOCE MÁS', '/contacto');
    row = db.prepare('SELECT * FROM homes LIMIT 1').get();
  }
  return row;
}

function getContact() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  if (!row) {
    db.prepare(
      `INSERT INTO contacts (email, phone, address, city, socialMedia, schedules, departments) VALUES (?,?,?,?,?,?,?)`
    ).run('elviveiglesia@gmail.com', '+54 (11) 503-621-41', 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.', 'La Matanza, Buenos Aires, Argentina', '{}', '{}', '[]');
    row = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  }
  return row;
}

function getLayout() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM layouts LIMIT 1').get();
  if (!row) {
    const defaultNav = JSON.stringify([{ label: 'Inicio', path: '/' }, { label: 'Ministerios', path: '/ministerios' }, { label: 'Días de Reunión', path: '/dias-reunion' }, { label: 'Contacto', path: '/contacto' }]);
    const defaultQuick = JSON.stringify([{ label: 'Días de Reunión', path: '/dias-reunion' }, { label: 'Ministerios', path: '/ministerios' }, { label: 'Contacto', path: '/contacto' }]);
    db.prepare(
      `INSERT INTO layouts (navLinks, footerBrandTitle, footerBrandDescription, footerFacebookUrl, footerInstagramUrl, footerYoutubeUrl, footerAddress, footerEmail, footerPhone, footerCopyright, footerPrivacyUrl, footerTermsUrl, quickLinks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(defaultNav, 'ÉL VIVE IGLESIA', 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.', 'https://www.facebook.com/profile.php?id=100081093856222', 'https://www.instagram.com/elviveiglesia/', 'https://www.youtube.com/@elviveiglesia', 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.', 'elviveiglesia@gmail.com', '+54 (11) 503-621-41', '© 2025 ÉL VIVE IGLESIA. Todos los derechos reservados.', '#', '#', defaultQuick);
    row = db.prepare('SELECT * FROM layouts LIMIT 1').get();
  }
  return row;
}

function enrichMinistryWithMedia(ministry) {
  const mid = ministry.id;
  if (!mid) return ministry;
  const db = getDb();
  const hasIcon = db.prepare('SELECT 1 FROM ministry_media WHERE ministryId=? AND mediaType=?').get(String(mid), 'icon');
  if (hasIcon) ministry.iconUrl = `/api/ministry/${mid}/icon`;
  const hasCard = db.prepare('SELECT 1 FROM ministry_card_images WHERE ministryId=?').get(String(mid));
  if (hasCard) ministry.cardImageUrl = `/api/ministry/${mid}/card-image`;
  const photos = db.prepare('SELECT id, imageName FROM ministry_media WHERE ministryId=? AND mediaType=? ORDER BY sortOrder').all(mid, 'photo');
  if (photos.length) ministry.photos = photos.map((p) => ({ id: p.id, url: `/api/ministry/${mid}/photo/${p.id}`, name: p.imageName }));
  const videos = db.prepare('SELECT id, videoName FROM ministry_videos WHERE ministryId=? ORDER BY sortOrder').all(mid);
  if (videos.length) ministry.internalVideos = videos.map((v) => ({ id: v.id, url: `/api/ministry/${mid}/video/${v.id}`, name: v.videoName }));
  const hasPdf = db.prepare('SELECT fileName FROM ministry_pdfs WHERE ministryId=?').get(String(mid));
  if (hasPdf) ministry.pdfUrl = `/api/ministry/${mid}/pdf`;
  return ministry;
}

// GET /public/config/home
router.get('/config/home', (req, res) => {
  const home = getHome();
  const db = getDb();
  const hasVideo = !!(
    home.heroVideoPath ||
    home.heroVideo2Path ||
    home.heroVideoDomLightPath ||
    home.heroVideoDomDarkPath ||
    home.heroVideoMierLightPath ||
    home.heroVideoMierDarkPath
  );
  const hasIcon = !!(
    home.heroIconDomPath ||
    home.heroIconMierPath ||
    home.heroIconDomLightPath ||
    home.heroIconDomDarkPath ||
    home.heroIconMierLightPath ||
    home.heroIconMierDarkPath
  );
  const cardRows = db.prepare('SELECT cardIndex, imageName FROM meeting_card_images').all();
  const cardImages = {};
  cardRows.forEach((r) => (cardImages[r.cardIndex] = { cardIndex: r.cardIndex, imageName: r.imageName }));

  let ministriesSummary = parseJson(home.ministriesSummary);
  if (ministriesSummary?.ministries) {
    ministriesSummary = { ...ministriesSummary, ministries: ministriesSummary.ministries.map(enrichMinistryWithMedia) };
  } else if (ministriesSummary?.ministryIds) {
    const mContent = db.prepare('SELECT ministries FROM ministries_content LIMIT 1').get();
    const all = parseJson(mContent?.ministries) || [];
    const byId = {};
    all.forEach((m) => (byId[String(m.id)] = m));
    const ministries = (ministriesSummary.ministryIds || []).slice(0, 4).map((id) => byId[String(id)]).filter(Boolean).map(enrichMinistryWithMedia);
    ministriesSummary = { ...ministriesSummary, ministries };
  }

  const theme = {
    context: { variant: isMiercolesTheme() ? 2 : 1, variantLabel: isMiercolesTheme() ? 'mondayWednesday' : 'thursdayToSunday', now: new Date().toISOString() },
    videoUrl: '/api/home/current-video',
    iconUrl: '/api/home/current-icon',
    videoUrlLight: '/api/home/video-light',
    videoUrlDark: '/api/home/video-dark',
    iconUrlLight: '/api/home/icon-light',
    iconUrlDark: '/api/home/icon-dark',
    videoUrlDomLight: '/api/home/video-dom-light',
    videoUrlDomDark: '/api/home/video-dom-dark',
    videoUrlMierLight: '/api/home/video-mier-light',
    videoUrlMierDark: '/api/home/video-mier-dark',
    iconUrlDomLight: '/api/home/icon-dom-light',
    iconUrlDomDark: '/api/home/icon-dom-dark',
    iconUrlMierLight: '/api/home/icon-mier-light',
    iconUrlMierDark: '/api/home/icon-mier-dark',
    heroBgLightColor: home.heroBgLightColor ?? '#ffffff',
    heroBgDarkColor: home.heroBgDarkColor ?? '#000000',
    heroFadeEnabled: home.heroFadeEnabled === null || home.heroFadeEnabled === undefined ? true : !!home.heroFadeEnabled,
    heroFadeLightColor: home.heroFadeLightColor ?? '#ffffff',
    heroFadeDarkColor: home.heroFadeDarkColor ?? '#000000',
    palette: null,
  };

  res.json({
    id: home.id,
    heroTitle: home.heroTitle,
    heroButton1Text: home.heroButton1Text,
    heroButton1Link: home.heroButton1Link,
    heroButton2Text: home.heroButton2Text,
    heroButton2Link: home.heroButton2Link,
    heroVideoUrl: '/api/home/current-video',
    hasVideo,
    hasIcon,
    celebrations: parseJson(home.celebrations) ?? [],
    meetingDaysSummary: parseJson(home.meetingDaysSummary),
    ministriesSummary,
    cardImages,
    theme,
  });
});

// GET /public/config/contact
router.get('/config/contact', (req, res) => {
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
  });
});

// GET /public/config/layout
router.get('/config/layout', (req, res) => {
  const db = getDb();
  const layout = getLayout();
  const nav = parseJson(layout.navLinks) || [];
  const quick = parseJson(layout.quickLinks) || [];
  const headerIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header');
  const headerIconLight = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header-light');
  const headerIconDark = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header-dark');
  const footerIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer');
  const footerIconLight = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer-light');
  const footerIconDark = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer-dark');
  res.json({
    navLinks: nav,
    footerBrandTitle: layout.footerBrandTitle ?? 'ÉL VIVE IGLESIA',
    footerBrandDescription: layout.footerBrandDescription ?? '',
    footerFacebookUrl: layout.footerFacebookUrl ?? '',
    footerInstagramUrl: layout.footerInstagramUrl ?? '',
    footerYoutubeUrl: layout.footerYoutubeUrl ?? '',
    footerAddress: layout.footerAddress ?? '',
    footerEmail: layout.footerEmail ?? '',
    footerPhone: layout.footerPhone ?? '',
    footerCopyright: layout.footerCopyright ?? '',
    footerPrivacyUrl: layout.footerPrivacyUrl ?? '#',
    footerTermsUrl: layout.footerTermsUrl ?? '#',
    quickLinks: quick,
    whatsappNumber: layout.whatsappNumber ?? '',
    headerIconUrl: headerIcon ? '/api/section-icon/layout/header' : null,
    headerIconUrlLight: headerIconLight ? '/api/section-icon/layout/header-light' : null,
    headerIconUrlDark: headerIconDark ? '/api/section-icon/layout/header-dark' : null,
    footerIconUrl: footerIcon ? '/api/section-icon/layout/footer' : null,
    footerIconUrlLight: footerIconLight ? '/api/section-icon/layout/footer-light' : null,
    footerIconUrlDark: footerIconDark ? '/api/section-icon/layout/footer-dark' : null,
  });
});

// GET /public/config/ministries
router.get('/config/ministries', (req, res) => {
  const db = getDb();
  let m = db.prepare('SELECT * FROM ministries_content LIMIT 1').get();
  if (!m) {
    db.prepare('INSERT INTO ministries_content (id) VALUES (1)').run();
    m = db.prepare('SELECT * FROM ministries_content LIMIT 1').get();
  }
  const ministries = (parseJson(m.ministries) || []).map(enrichMinistryWithMedia);
  const sectionIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'section');
  const heroLightIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'hero-light');
  const heroDarkIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'hero-dark');
  const processIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'process');
  const testimonialsIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'testimonials');
  const faqIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('ministries', 'faq');
  const pageContent = parseJson(m.pageContent) || {};
  if (sectionIcon) pageContent.sectionIconUrl = '/api/section-icon/ministries/section';
  if (processIcon) pageContent.processIconUrl = '/api/section-icon/ministries/process';
  if (testimonialsIcon) pageContent.testimonialsIconUrl = '/api/section-icon/ministries/testimonials';
  if (faqIcon) pageContent.faqIconUrl = '/api/section-icon/ministries/faq';

  res.json({
    hero: {
      ...(parseJson(m.hero) || {}),
      heroImageUrlLight: heroLightIcon ? '/api/section-icon/ministries/hero-light' : null,
      heroImageUrlDark: heroDarkIcon ? '/api/section-icon/ministries/hero-dark' : null,
    },
    ministries,
    process: parseJson(m.process),
    testimonials: parseJson(m.testimonials) ?? [],
    faqs: parseJson(m.faqs) ?? [],
    pageContent,
  });
});

// GET /public/config/ministries/:id
router.get('/config/ministries/:id', (req, res) => {
  const m = getDb().prepare('SELECT ministries FROM ministries_content LIMIT 1').get();
  const list = parseJson(m?.ministries) || [];
  const ministry = list.find((x) => String(x.id) === String(req.params.id));
  if (!ministry) return res.status(404).json({ error: 'Ministerio no encontrado' });
  res.json(enrichMinistryWithMedia({ ...ministry }));
});

// GET /public/config/meeting-days
router.get('/config/meeting-days', (req, res) => {
  const db = getDb();
  let md = db.prepare('SELECT * FROM meeting_days LIMIT 1').get();
  if (!md) {
    db.prepare('INSERT INTO meeting_days (id) VALUES (1)').run();
    md = db.prepare('SELECT * FROM meeting_days LIMIT 1').get();
  }
  const events = db.prepare('SELECT * FROM events ORDER BY date, time').all();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date && e.date >= today);

  const heroLightIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'hero-light');
  const heroDarkIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('meeting-days', 'hero-dark');

  res.json({
    hero: {
      ...(parseJson(md.hero) || {}),
      heroImageUrlLight: heroLightIcon ? '/api/section-icon/meeting-days/hero-light' : null,
      heroImageUrlDark: heroDarkIcon ? '/api/section-icon/meeting-days/hero-dark' : null,
    },
    calendarEvents: parseJson(md.calendarEvents),
    upcomingEvents: { ...parseJson(md.upcomingEvents), events: upcoming },
    eventCta: parseJson(md.eventCta),
    recurringMeetings: parseJson(md.recurringMeetings),
  });
});

// GET /public/events/upcoming
router.get('/events/upcoming', (req, res) => {
  const md = getDb().prepare('SELECT upcomingEvents FROM meeting_days LIMIT 1').get();
  const section = parseJson(md?.upcomingEvents);
  const events = getDb().prepare('SELECT * FROM events WHERE date >= date("now") ORDER BY date, time').all();
  res.json({ section, events });
});

// GET /public/events/calendar
router.get('/events/calendar', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM events ORDER BY date, time').all();
  res.json(rows);
});

// GET /public/config/donaciones
router.get('/config/donaciones', (req, res) => {
  const db = getDb();
  let row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get('donaciones');
  if (!row) {
    db.prepare('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)').run('donaciones', '{}');
    row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get('donaciones');
  }
  const raw = parseJson(row.page_content) ?? {};
  res.json({ pageContent: enrichDonacionesPageContent(raw) });
});

// GET /public/config/nosotros
router.get('/config/nosotros', (req, res) => {
  const db = getDb();
  let row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get('nosotros');
  if (!row) {
    db.prepare('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)').run('nosotros', '{}');
    row = db.prepare('SELECT * FROM generic_pages WHERE page_key=?').get('nosotros');
  }
  res.json({ pageContent: parseJson(row.page_content) ?? {} });
});

export default router;
