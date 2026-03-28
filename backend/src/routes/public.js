import { Router } from 'express';
import { dbGet, dbRun, dbAll, parseJson } from '../db/index.js';
import { isMiercolesTheme } from '../lib/argentina-time.js';
import { enrichDonacionesPageContent } from '../lib/donaciones-page-defaults.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

async function getHome() {
  let row = await dbGet('SELECT * FROM homes LIMIT 1');
  if (!row) {
    await dbRun(
      `INSERT INTO homes (heroTitle, heroButton1Text, heroButton1Link, heroButton2Text, heroButton2Link) VALUES (?,?,?,?,?)`,
      ['ÉL VIVE IGLESIA', 'VER EVENTOS', '/dias-reunion', 'CONOCE MÁS', '/contacto']
    );
    row = await dbGet('SELECT * FROM homes LIMIT 1');
  }
  return row;
}

async function getContact() {
  let row = await dbGet('SELECT * FROM contacts LIMIT 1');
  if (!row) {
    await dbRun(
      `INSERT INTO contacts (email, phone, address, city, socialMedia, schedules, departments) VALUES (?,?,?,?,?,?,?)`,
      [
        'elviveiglesia@gmail.com',
        '+54 (11) 503-621-41',
        'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
        'La Matanza, Buenos Aires, Argentina',
        '{}',
        '{}',
        '[]',
      ]
    );
    row = await dbGet('SELECT * FROM contacts LIMIT 1');
  }
  return row;
}

async function getLayout() {
  let row = await dbGet('SELECT * FROM layouts LIMIT 1');
  if (!row) {
    const defaultNav = JSON.stringify([
      { label: 'Inicio', path: '/' },
      { label: 'Ministerios', path: '/ministerios' },
      { label: 'Días de Reunión', path: '/dias-reunion' },
      { label: 'Contacto', path: '/contacto' },
    ]);
    const defaultQuick = JSON.stringify([
      { label: 'Días de Reunión', path: '/dias-reunion' },
      { label: 'Ministerios', path: '/ministerios' },
      { label: 'Contacto', path: '/contacto' },
    ]);
    await dbRun(
      `INSERT INTO layouts (navLinks, footerBrandTitle, footerBrandDescription, footerFacebookUrl, footerInstagramUrl, footerYoutubeUrl, footerAddress, footerEmail, footerPhone, footerCopyright, footerPrivacyUrl, footerTermsUrl, quickLinks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        defaultNav,
        'ÉL VIVE IGLESIA',
        'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.',
        'https://www.facebook.com/profile.php?id=100081093856222',
        'https://www.instagram.com/elviveiglesia/',
        'https://www.youtube.com/@elviveiglesia',
        'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
        'elviveiglesia@gmail.com',
        '+54 (11) 503-621-41',
        '© 2025 ÉL VIVE IGLESIA. Todos los derechos reservados.',
        '#',
        '#',
        defaultQuick,
      ]
    );
    row = await dbGet('SELECT * FROM layouts LIMIT 1');
  }
  return row;
}

async function enrichMinistryWithMedia(ministry) {
  const mid = ministry.id;
  if (!mid) return ministry;
  const hasIcon = await dbGet('SELECT 1 FROM ministry_media WHERE ministryId=? AND mediaType=?', [String(mid), 'icon']);
  if (hasIcon) ministry.iconUrl = `/api/ministry/${mid}/icon`;
  const hasCard = await dbGet('SELECT 1 FROM ministry_card_images WHERE ministryId=?', [String(mid)]);
  if (hasCard) ministry.cardImageUrl = `/api/ministry/${mid}/card-image`;
  const photos = await dbAll(
    'SELECT id, imageName FROM ministry_media WHERE ministryId=? AND mediaType=? ORDER BY sortOrder',
    [mid, 'photo']
  );
  if (photos.length) ministry.photos = photos.map((p) => ({ id: p.id, url: `/api/ministry/${mid}/photo/${p.id}`, name: p.imageName }));
  const videos = await dbAll('SELECT id, videoName FROM ministry_videos WHERE ministryId=? ORDER BY sortOrder', [mid]);
  if (videos.length) ministry.internalVideos = videos.map((v) => ({ id: v.id, url: `/api/ministry/${mid}/video/${v.id}`, name: v.videoName }));
  const hasPdf = await dbGet('SELECT fileName FROM ministry_pdfs WHERE ministryId=?', [String(mid)]);
  if (hasPdf) ministry.pdfUrl = `/api/ministry/${mid}/pdf`;
  return ministry;
}

router.get(
  '/config/home',
  asyncHandler(async (req, res) => {
    const home = await getHome();
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
    const cardRows = await dbAll('SELECT cardIndex, imageName FROM meeting_card_images');
    const cardImages = {};
    cardRows.forEach((r) => (cardImages[r.cardIndex] = { cardIndex: r.cardIndex, imageName: r.imageName }));

    let ministriesSummary = parseJson(home.ministriesSummary);
    if (ministriesSummary?.ministries) {
      const list = [];
      for (const m of ministriesSummary.ministries) {
        list.push(await enrichMinistryWithMedia({ ...m }));
      }
      ministriesSummary = { ...ministriesSummary, ministries: list };
    } else if (ministriesSummary?.ministryIds) {
      const mContent = await dbGet('SELECT ministries FROM ministries_content LIMIT 1');
      const all = parseJson(mContent?.ministries) || [];
      const byId = {};
      all.forEach((m) => (byId[String(m.id)] = m));
      const ministries = [];
      for (const id of (ministriesSummary.ministryIds || []).slice(0, 4)) {
        const m = byId[String(id)];
        if (m) ministries.push(await enrichMinistryWithMedia(m));
      }
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
  })
);

router.get(
  '/config/contact',
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
    });
  })
);

router.get(
  '/config/layout',
  asyncHandler(async (req, res) => {
    const layout = await getLayout();
    const nav = parseJson(layout.navLinks) || [];
    const quick = parseJson(layout.quickLinks) || [];
    const headerIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header']);
    const headerIconLight = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header-light']);
    const headerIconDark = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header-dark']);
    const footerIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer']);
    const footerIconLight = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer-light']);
    const footerIconDark = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer-dark']);
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
  })
);

router.get(
  '/config/ministries',
  asyncHandler(async (req, res) => {
    let m = await dbGet('SELECT * FROM ministries_content LIMIT 1');
    if (!m) {
      await dbRun('INSERT INTO ministries_content (id) VALUES (1)');
      m = await dbGet('SELECT * FROM ministries_content LIMIT 1');
    }
    const rawList = parseJson(m.ministries) || [];
    const ministries = [];
    for (const x of rawList) {
      ministries.push(await enrichMinistryWithMedia({ ...x }));
    }
    const sectionIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'section']);
    const heroLightIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'hero-light']);
    const heroDarkIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'hero-dark']);
    const processIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'process']);
    const testimonialsIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'testimonials']);
    const faqIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['ministries', 'faq']);
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
  })
);

router.get(
  '/config/ministries/:id',
  asyncHandler(async (req, res) => {
    const m = await dbGet('SELECT ministries FROM ministries_content LIMIT 1');
    const list = parseJson(m?.ministries) || [];
    const ministry = list.find((x) => String(x.id) === String(req.params.id));
    if (!ministry) return res.status(404).json({ error: 'Ministerio no encontrado' });
    res.json(await enrichMinistryWithMedia({ ...ministry }));
  })
);

router.get(
  '/config/meeting-days',
  asyncHandler(async (req, res) => {
    let md = await dbGet('SELECT * FROM meeting_days LIMIT 1');
    if (!md) {
      await dbRun('INSERT INTO meeting_days (id) VALUES (1)');
      md = await dbGet('SELECT * FROM meeting_days LIMIT 1');
    }
    const events = await dbAll('SELECT * FROM events ORDER BY date, time');
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events.filter((e) => e.date && e.date >= today);

    const heroLightIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['meeting-days', 'hero-light']);
    const heroDarkIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['meeting-days', 'hero-dark']);

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
  })
);

router.get(
  '/events/upcoming',
  asyncHandler(async (req, res) => {
    const md = await dbGet('SELECT upcomingEvents FROM meeting_days LIMIT 1');
    const section = parseJson(md?.upcomingEvents);
    const events = await dbAll('SELECT * FROM events WHERE date >= date("now") ORDER BY date, time');
    res.json({ section, events });
  })
);

router.get(
  '/events/calendar',
  asyncHandler(async (req, res) => {
    const rows = await dbAll('SELECT * FROM events ORDER BY date, time');
    res.json(rows);
  })
);

router.get(
  '/config/donaciones',
  asyncHandler(async (req, res) => {
    let row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', ['donaciones']);
    if (!row) {
      await dbRun('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)', ['donaciones', '{}']);
      row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', ['donaciones']);
    }
    const raw = parseJson(row.page_content) ?? {};
    res.json({ pageContent: enrichDonacionesPageContent(raw) });
  })
);

router.get(
  '/config/nosotros',
  asyncHandler(async (req, res) => {
    let row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', ['nosotros']);
    if (!row) {
      await dbRun('INSERT INTO generic_pages (page_key, page_content) VALUES (?, ?)', ['nosotros', '{}']);
      row = await dbGet('SELECT * FROM generic_pages WHERE page_key=?', ['nosotros']);
    }
    res.json({ pageContent: parseJson(row.page_content) ?? {} });
  })
);

export default router;
