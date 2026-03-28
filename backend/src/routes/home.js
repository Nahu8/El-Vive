import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbGet, dbRun, dbAll, parseJson, stringifyJson } from '../db/index.js';
import { saveFile, resolvePath, sendFile } from '../lib/uploads.js';
import { isMiercolesTheme } from '../lib/argentina-time.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function getHome() {
  let row = await dbGet('SELECT * FROM homes LIMIT 1');
  if (!row) {
    await dbRun(
      `INSERT INTO homes (heroTitle, heroButton1Text, heroButton1Link, heroButton2Text, heroButton2Link)
       VALUES (?, ?, ?, ?, ?)`,
      ['ÉL VIVE IGLESIA', 'VER EVENTOS', '/dias-reunion', 'CONOCE MÁS', '/contacto']
    );
    row = await dbGet('SELECT * FROM homes LIMIT 1');
  }
  return row;
}

async function uploadHomeMedia(req, res, config) {
  if (!req.file) return res.status(400).json({ error: `No se proporcionó ${config.kind}` });
  if (!req.file.mimetype.startsWith(config.mimePrefix)) {
    return res.status(400).json({ error: `El archivo debe ser ${config.kind === 'video' ? 'un video' : 'una imagen'}` });
  }
  const home = await getHome();
  const ext = path.extname(req.file.originalname) || config.defaultExt;
  const rel = saveFile('home', `${config.filePrefix}-${home.id}${ext}`, req.file.buffer);
  await dbRun(`UPDATE homes SET ${config.pathCol}=?, ${config.mimeCol}=?, ${config.nameCol}=?, updated_at=datetime('now') WHERE id=?`, [
    rel,
    req.file.mimetype,
    req.file.originalname,
    home.id,
  ]);
  return res.json({ message: `${config.label} guardado`, name: req.file.originalname });
}

async function getHomeMedia(req, res, config) {
  const home = await getHome();
  const rel = home[config.pathCol];
  if (!rel) return res.status(404).json({ error: `No hay ${config.label.toLowerCase()}` });
  return sendFile(res, resolvePath(rel), home[config.mimeCol] || config.fallbackMime, home[config.nameCol] || undefined);
}

async function deleteHomeMedia(req, res, config) {
  const home = await getHome();
  const rel = home[config.pathCol];
  if (rel) {
    const abs = resolvePath(rel);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  await dbRun(`UPDATE homes SET ${config.pathCol}=NULL, ${config.mimeCol}=NULL, ${config.nameCol}=NULL, updated_at=datetime('now') WHERE id=?`, [home.id]);
  return res.json({ message: `${config.label} eliminado` });
}

// GET /api/home
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const cardRows = await dbAll('SELECT cardIndex, imageName FROM meeting_card_images');
  const cardImages = {};
  cardRows.forEach((r) => (cardImages[r.cardIndex] = { cardIndex: r.cardIndex, imageName: r.imageName }));

  res.json({
    id: home.id,
    heroTitle: home.heroTitle,
    heroButton1Text: home.heroButton1Text,
    heroButton1Link: home.heroButton1Link,
    heroButton2Text: home.heroButton2Text,
    heroButton2Link: home.heroButton2Link,
    heroBgLightColor: home.heroBgLightColor ?? '#ffffff',
    heroBgDarkColor: home.heroBgDarkColor ?? '#000000',
    heroFadeEnabled: home.heroFadeEnabled === null || home.heroFadeEnabled === undefined ? true : !!home.heroFadeEnabled,
    heroFadeLightColor: home.heroFadeLightColor ?? '#ffffff',
    heroFadeDarkColor: home.heroFadeDarkColor ?? '#000000',
    heroVideoUrl: home.heroVideoUrl ?? '',
    hasVideoLight: !!home.heroVideoPath,
    heroVideoLightName: home.heroVideoName ?? '',
    hasVideoDark: !!home.heroVideo2Path,
    heroVideoDarkName: home.heroVideo2Name ?? '',
    hasIconLight: !!home.heroIconDomPath,
    heroIconLightName: home.heroIconDomName ?? '',
    hasIconDark: !!home.heroIconMierPath,
    heroIconDarkName: home.heroIconMierName ?? '',
    // 2x2 (dia x modo)
    hasVideoDomLight: !!home.heroVideoDomLightPath,
    heroVideoDomLightName: home.heroVideoDomLightName ?? '',
    hasVideoDomDark: !!home.heroVideoDomDarkPath,
    heroVideoDomDarkName: home.heroVideoDomDarkName ?? '',
    hasVideoMierLight: !!home.heroVideoMierLightPath,
    heroVideoMierLightName: home.heroVideoMierLightName ?? '',
    hasVideoMierDark: !!home.heroVideoMierDarkPath,
    heroVideoMierDarkName: home.heroVideoMierDarkName ?? '',
    hasIconDomLight: !!home.heroIconDomLightPath,
    heroIconDomLightName: home.heroIconDomLightName ?? '',
    hasIconDomDark: !!home.heroIconDomDarkPath,
    heroIconDomDarkName: home.heroIconDomDarkName ?? '',
    hasIconMierLight: !!home.heroIconMierLightPath,
    heroIconMierLightName: home.heroIconMierLightName ?? '',
    hasIconMierDark: !!home.heroIconMierDarkPath,
    heroIconMierDarkName: home.heroIconMierDarkName ?? '',
    // Compatibilidad (nombres anteriores)
    hasVideoDomingo: !!home.heroVideoPath,
    heroVideoDomingoName: home.heroVideoName ?? '',
    hasVideoMiercoles: !!home.heroVideo2Path,
    heroVideoMiercolesName: home.heroVideo2Name ?? '',
    hasIconDomingo: !!home.heroIconDomPath,
    heroIconDomingoName: home.heroIconDomName ?? '',
    hasIconMiercoles: !!home.heroIconMierPath,
    heroIconMiercolesName: home.heroIconMierName ?? '',
    video1Url: home.video1Url ?? '',
    video2Url: home.video2Url ?? '',
    celebrations: parseJson(home.celebrations) ?? [],
    meetingDaysSummary: parseJson(home.meetingDaysSummary),
    ministriesSummary: parseJson(home.ministriesSummary),
    cardImages,
    createdAt: home.created_at,
    updatedAt: home.updated_at,
  });
  })
);

// PUT /api/home
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const home = await getHome();
  const body = { ...req.body };
  delete body.heroVideoPath;
  delete body.heroVideo2Path;
  delete body.heroIconDomPath;
  delete body.heroIconMierPath;
  const fields = ['heroTitle', 'heroButton1Text', 'heroButton1Link', 'heroButton2Text', 'heroButton2Link', 'heroVideoUrl', 'currentTheme', 'celebrations', 'meetingDaysSummary', 'ministriesSummary'];
  const updates = {};
  fields.forEach((f) => {
    if (body[f] !== undefined) updates[f] = typeof body[f] === 'object' ? stringifyJson(body[f]) : body[f];
  });
  if (Object.keys(updates).length) {
    const set = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    await dbRun(`UPDATE homes SET ${set}, updated_at = datetime('now') WHERE id = ?`, [...Object.values(updates), home.id]);
  }
  res.json({ message: 'Home actualizado' });
  })
);

// PATCH /api/home/hero
router.patch(
  '/hero',
  asyncHandler(async (req, res) => {
    const home = await getHome();
  const {
    heroTitle,
    heroButton1Text,
    heroButton1Link,
    heroButton2Text,
    heroButton2Link,
    heroBgLightColor,
    heroBgDarkColor,
    heroFadeEnabled,
    heroFadeLightColor,
    heroFadeDarkColor
  } = req.body || {};
  await dbRun(
    `UPDATE homes SET heroTitle=?, heroButton1Text=?, heroButton1Link=?, heroButton2Text=?, heroButton2Link=?, heroBgLightColor=?, heroBgDarkColor=?, heroFadeEnabled=?, heroFadeLightColor=?, heroFadeDarkColor=?, updated_at=datetime('now') WHERE id=?`,
    [
      heroTitle ?? home.heroTitle,
      heroButton1Text ?? home.heroButton1Text,
      heroButton1Link ?? home.heroButton1Link,
      heroButton2Text ?? home.heroButton2Text,
      heroButton2Link ?? home.heroButton2Link,
      heroBgLightColor ?? home.heroBgLightColor ?? '#ffffff',
      heroBgDarkColor ?? home.heroBgDarkColor ?? '#000000',
      heroFadeEnabled === undefined || heroFadeEnabled === null
        ? home.heroFadeEnabled === null || home.heroFadeEnabled === undefined
          ? 1
          : Number(!!home.heroFadeEnabled)
        : Number(!!heroFadeEnabled),
      heroFadeLightColor ?? home.heroFadeLightColor ?? '#ffffff',
      heroFadeDarkColor ?? home.heroFadeDarkColor ?? '#000000',
      home.id,
    ]
  );
  res.json({ message: 'Hero actualizado' });
  })
);

// --- Video Modo Día ---
router.post(
  '/video',
  upload.single('video'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó ningún archivo de video' });
    if (!req.file.mimetype.startsWith('video/')) return res.status(400).json({ error: 'El archivo debe ser un video' });
    const home = await getHome();
    const rel = saveFile('home', `hero-video-${home.id}.${path.extname(req.file.originalname) || '.mp4'}`, req.file.buffer);
    await dbRun("UPDATE homes SET heroVideoPath=?, heroVideoMime=?, heroVideoName=?, updated_at=datetime('now') WHERE id=?", [
      rel,
      req.file.mimetype,
      req.file.originalname,
      home.id,
    ]);
    res.json({ message: 'Video modo día guardado', heroVideoName: req.file.originalname });
  })
);

router.get(
  '/video',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroVideoPath) return res.status(404).json({ error: 'No hay video guardado' });
    const abs = resolvePath(home.heroVideoPath);
    sendFile(res, abs, home.heroVideoMime || 'video/mp4', home.heroVideoName || 'video.mp4');
  })
);

router.delete(
  '/video',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (home.heroVideoPath) {
      const abs = resolvePath(home.heroVideoPath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun("UPDATE homes SET heroVideoPath=NULL, heroVideoMime=NULL, heroVideoName=NULL, updated_at=datetime('now') WHERE id=?", [home.id]);
    res.json({ message: 'Video eliminado' });
  })
);

// --- Video Modo Noche ---
router.post(
  '/video2',
  upload.single('video'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó ningún archivo de video' });
    if (!req.file.mimetype.startsWith('video/')) return res.status(400).json({ error: 'El archivo debe ser un video' });
    const home = await getHome();
    const rel = saveFile('home', `hero-video2-${home.id}.${path.extname(req.file.originalname) || '.mp4'}`, req.file.buffer);
    await dbRun("UPDATE homes SET heroVideo2Path=?, heroVideo2Mime=?, heroVideo2Name=?, updated_at=datetime('now') WHERE id=?", [
      rel,
      req.file.mimetype,
      req.file.originalname,
      home.id,
    ]);
    res.json({ message: 'Video modo noche guardado', heroVideoName: req.file.originalname });
  })
);

router.get(
  '/video2',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroVideo2Path) return res.status(404).json({ error: 'No hay video guardado' });
    const abs = resolvePath(home.heroVideo2Path);
    sendFile(res, abs, home.heroVideo2Mime || 'video/mp4', home.heroVideo2Name || 'video.mp4');
  })
);

router.delete(
  '/video2',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (home.heroVideo2Path) {
      const abs = resolvePath(home.heroVideo2Path);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun("UPDATE homes SET heroVideo2Path=NULL, heroVideo2Mime=NULL, heroVideo2Name=NULL, updated_at=datetime('now') WHERE id=?", [home.id]);
    res.json({ message: 'Video eliminado' });
  })
);

// GET /api/home/current-video (compat, basado en día Argentina)
router.get(
  '/current-video',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const useMier = isMiercolesTheme();
    const dark = String(req.query.dark || '').toLowerCase();
    const isDark = dark === '1' || dark === 'true';

    if (useMier) {
      if (isDark && home.heroVideoMierDarkPath) return sendFile(res, resolvePath(home.heroVideoMierDarkPath), home.heroVideoMierDarkMime || 'video/mp4');
      if (!isDark && home.heroVideoMierLightPath) return sendFile(res, resolvePath(home.heroVideoMierLightPath), home.heroVideoMierLightMime || 'video/mp4');
      if (home.heroVideoMierLightPath) return sendFile(res, resolvePath(home.heroVideoMierLightPath), home.heroVideoMierLightMime || 'video/mp4');
      if (home.heroVideoMierDarkPath) return sendFile(res, resolvePath(home.heroVideoMierDarkPath), home.heroVideoMierDarkMime || 'video/mp4');
    } else {
      if (isDark && home.heroVideoDomDarkPath) return sendFile(res, resolvePath(home.heroVideoDomDarkPath), home.heroVideoDomDarkMime || 'video/mp4');
      if (!isDark && home.heroVideoDomLightPath) return sendFile(res, resolvePath(home.heroVideoDomLightPath), home.heroVideoDomLightMime || 'video/mp4');
      if (home.heroVideoDomLightPath) return sendFile(res, resolvePath(home.heroVideoDomLightPath), home.heroVideoDomLightMime || 'video/mp4');
      if (home.heroVideoDomDarkPath) return sendFile(res, resolvePath(home.heroVideoDomDarkPath), home.heroVideoDomDarkMime || 'video/mp4');
    }

    if (useMier && home.heroVideo2Path) return sendFile(res, resolvePath(home.heroVideo2Path), home.heroVideo2Mime || 'video/mp4');
    if (home.heroVideoPath) return sendFile(res, resolvePath(home.heroVideoPath), home.heroVideoMime || 'video/mp4');
    res.status(404).json({ error: 'No hay video para hoy' });
  })
);

// GET /api/home/video-light
router.get(
  '/video-light',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroVideoPath) return res.status(404).json({ error: 'No hay video modo día' });
    return sendFile(res, resolvePath(home.heroVideoPath), home.heroVideoMime || 'video/mp4');
  })
);

// GET /api/home/video-dark
router.get(
  '/video-dark',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroVideo2Path) return res.status(404).json({ error: 'No hay video modo noche' });
    return sendFile(res, resolvePath(home.heroVideo2Path), home.heroVideo2Mime || 'video/mp4');
  })
);

// --- Videos 2x2 (día x modo) ---
router.post(
  '/video-dom-light',
  upload.single('video'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'video',
      mimePrefix: 'video/',
      defaultExt: '.mp4',
      filePrefix: 'hero-video-dom-light',
      pathCol: 'heroVideoDomLightPath',
      mimeCol: 'heroVideoDomLightMime',
      nameCol: 'heroVideoDomLightName',
      label: 'Video Domingo Día',
    })
  )
);
router.get(
  '/video-dom-light',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroVideoDomLightPath',
      mimeCol: 'heroVideoDomLightMime',
      nameCol: 'heroVideoDomLightName',
      fallbackMime: 'video/mp4',
      label: 'Video Domingo Día',
    })
  )
);
router.delete(
  '/video-dom-light',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroVideoDomLightPath',
      mimeCol: 'heroVideoDomLightMime',
      nameCol: 'heroVideoDomLightName',
      label: 'Video Domingo Día',
    })
  )
);

router.post(
  '/video-dom-dark',
  upload.single('video'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'video',
      mimePrefix: 'video/',
      defaultExt: '.mp4',
      filePrefix: 'hero-video-dom-dark',
      pathCol: 'heroVideoDomDarkPath',
      mimeCol: 'heroVideoDomDarkMime',
      nameCol: 'heroVideoDomDarkName',
      label: 'Video Domingo Noche',
    })
  )
);
router.get(
  '/video-dom-dark',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroVideoDomDarkPath',
      mimeCol: 'heroVideoDomDarkMime',
      nameCol: 'heroVideoDomDarkName',
      fallbackMime: 'video/mp4',
      label: 'Video Domingo Noche',
    })
  )
);
router.delete(
  '/video-dom-dark',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroVideoDomDarkPath',
      mimeCol: 'heroVideoDomDarkMime',
      nameCol: 'heroVideoDomDarkName',
      label: 'Video Domingo Noche',
    })
  )
);

router.post(
  '/video-mier-light',
  upload.single('video'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'video',
      mimePrefix: 'video/',
      defaultExt: '.mp4',
      filePrefix: 'hero-video-mier-light',
      pathCol: 'heroVideoMierLightPath',
      mimeCol: 'heroVideoMierLightMime',
      nameCol: 'heroVideoMierLightName',
      label: 'Video Miércoles Día',
    })
  )
);
router.get(
  '/video-mier-light',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroVideoMierLightPath',
      mimeCol: 'heroVideoMierLightMime',
      nameCol: 'heroVideoMierLightName',
      fallbackMime: 'video/mp4',
      label: 'Video Miércoles Día',
    })
  )
);
router.delete(
  '/video-mier-light',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroVideoMierLightPath',
      mimeCol: 'heroVideoMierLightMime',
      nameCol: 'heroVideoMierLightName',
      label: 'Video Miércoles Día',
    })
  )
);

router.post(
  '/video-mier-dark',
  upload.single('video'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'video',
      mimePrefix: 'video/',
      defaultExt: '.mp4',
      filePrefix: 'hero-video-mier-dark',
      pathCol: 'heroVideoMierDarkPath',
      mimeCol: 'heroVideoMierDarkMime',
      nameCol: 'heroVideoMierDarkName',
      label: 'Video Miércoles Noche',
    })
  )
);
router.get(
  '/video-mier-dark',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroVideoMierDarkPath',
      mimeCol: 'heroVideoMierDarkMime',
      nameCol: 'heroVideoMierDarkName',
      fallbackMime: 'video/mp4',
      label: 'Video Miércoles Noche',
    })
  )
);
router.delete(
  '/video-mier-dark',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroVideoMierDarkPath',
      mimeCol: 'heroVideoMierDarkMime',
      nameCol: 'heroVideoMierDarkName',
      label: 'Video Miércoles Noche',
    })
  )
);

// --- Ícono Modo Día ---
router.post(
  '/icon-dom',
  upload.single('icon'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const home = await getHome();
    const rel = saveFile('home', `icon-dom-${home.id}${path.extname(req.file.originalname) || '.png'}`, req.file.buffer);
    await dbRun("UPDATE homes SET heroIconDomPath=?, heroIconDomMime=?, heroIconDomName=?, updated_at=datetime('now') WHERE id=?", [
      rel,
      req.file.mimetype,
      req.file.originalname,
      home.id,
    ]);
    res.json({ message: 'Ícono modo día guardado', iconName: req.file.originalname });
  })
);

router.get(
  '/icon-dom',
  asyncHandler(async (req, res) => {
    const home = await getHome();
  if (!home.heroIconDomPath) return res.status(404).json({ error: 'No hay ícono' });
  sendFile(res, resolvePath(home.heroIconDomPath), home.heroIconDomMime || 'image/png');
  })
);

router.delete(
  '/icon-dom',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (home.heroIconDomPath) {
      const abs = resolvePath(home.heroIconDomPath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun("UPDATE homes SET heroIconDomPath=NULL, heroIconDomMime=NULL, heroIconDomName=NULL, updated_at=datetime('now') WHERE id=?", [home.id]);
    res.json({ message: 'Ícono eliminado' });
  })
);

// --- Ícono Modo Noche ---
router.post(
  '/icon-mier',
  upload.single('icon'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const home = await getHome();
    const rel = saveFile('home', `icon-mier-${home.id}${path.extname(req.file.originalname) || '.png'}`, req.file.buffer);
    await dbRun("UPDATE homes SET heroIconMierPath=?, heroIconMierMime=?, heroIconMierName=?, updated_at=datetime('now') WHERE id=?", [
      rel,
      req.file.mimetype,
      req.file.originalname,
      home.id,
    ]);
    res.json({ message: 'Ícono modo noche guardado', iconName: req.file.originalname });
  })
);

router.get(
  '/icon-mier',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroIconMierPath) return res.status(404).json({ error: 'No hay ícono' });
    sendFile(res, resolvePath(home.heroIconMierPath), home.heroIconMierMime || 'image/png');
  })
);

router.delete(
  '/icon-mier',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (home.heroIconMierPath) {
      const abs = resolvePath(home.heroIconMierPath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun("UPDATE homes SET heroIconMierPath=NULL, heroIconMierMime=NULL, heroIconMierName=NULL, updated_at=datetime('now') WHERE id=?", [home.id]);
    res.json({ message: 'Ícono eliminado' });
  })
);

// GET /api/home/current-icon (compat, basado en día Argentina)
router.get(
  '/current-icon',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const useMier = isMiercolesTheme();
    const dark = String(req.query.dark || '').toLowerCase();
    const isDark = dark === '1' || dark === 'true';

    if (useMier) {
      if (isDark && home.heroIconMierDarkPath) return sendFile(res, resolvePath(home.heroIconMierDarkPath), home.heroIconMierDarkMime || 'image/png');
      if (!isDark && home.heroIconMierLightPath) return sendFile(res, resolvePath(home.heroIconMierLightPath), home.heroIconMierLightMime || 'image/png');
      if (home.heroIconMierLightPath) return sendFile(res, resolvePath(home.heroIconMierLightPath), home.heroIconMierLightMime || 'image/png');
      if (home.heroIconMierDarkPath) return sendFile(res, resolvePath(home.heroIconMierDarkPath), home.heroIconMierDarkMime || 'image/png');
    } else {
      if (isDark && home.heroIconDomDarkPath) return sendFile(res, resolvePath(home.heroIconDomDarkPath), home.heroIconDomDarkMime || 'image/png');
      if (!isDark && home.heroIconDomLightPath) return sendFile(res, resolvePath(home.heroIconDomLightPath), home.heroIconDomLightMime || 'image/png');
      if (home.heroIconDomLightPath) return sendFile(res, resolvePath(home.heroIconDomLightPath), home.heroIconDomLightMime || 'image/png');
      if (home.heroIconDomDarkPath) return sendFile(res, resolvePath(home.heroIconDomDarkPath), home.heroIconDomDarkMime || 'image/png');
    }

    if (useMier && home.heroIconMierPath) return sendFile(res, resolvePath(home.heroIconMierPath), home.heroIconMierMime || 'image/png');
    if (home.heroIconDomPath) return sendFile(res, resolvePath(home.heroIconDomPath), home.heroIconDomMime || 'image/png');
    res.status(404).json({ error: 'No hay ícono para hoy' });
  })
);

// GET /api/home/icon-light
router.get(
  '/icon-light',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroIconDomPath) return res.status(404).json({ error: 'No hay ícono modo día' });
    return sendFile(res, resolvePath(home.heroIconDomPath), home.heroIconDomMime || 'image/png');
  })
);

// GET /api/home/icon-dark
router.get(
  '/icon-dark',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    if (!home.heroIconMierPath) return res.status(404).json({ error: 'No hay ícono modo noche' });
    return sendFile(res, resolvePath(home.heroIconMierPath), home.heroIconMierMime || 'image/png');
  })
);

// --- Íconos 2x2 (día x modo) ---
router.post(
  '/icon-dom-light',
  upload.single('icon'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'imagen',
      mimePrefix: 'image/',
      defaultExt: '.png',
      filePrefix: 'hero-icon-dom-light',
      pathCol: 'heroIconDomLightPath',
      mimeCol: 'heroIconDomLightMime',
      nameCol: 'heroIconDomLightName',
      label: 'Ícono Domingo Día',
    })
  )
);
router.get(
  '/icon-dom-light',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroIconDomLightPath',
      mimeCol: 'heroIconDomLightMime',
      nameCol: 'heroIconDomLightName',
      fallbackMime: 'image/png',
      label: 'Ícono Domingo Día',
    })
  )
);
router.delete(
  '/icon-dom-light',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroIconDomLightPath',
      mimeCol: 'heroIconDomLightMime',
      nameCol: 'heroIconDomLightName',
      label: 'Ícono Domingo Día',
    })
  )
);

router.post(
  '/icon-dom-dark',
  upload.single('icon'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'imagen',
      mimePrefix: 'image/',
      defaultExt: '.png',
      filePrefix: 'hero-icon-dom-dark',
      pathCol: 'heroIconDomDarkPath',
      mimeCol: 'heroIconDomDarkMime',
      nameCol: 'heroIconDomDarkName',
      label: 'Ícono Domingo Noche',
    })
  )
);
router.get(
  '/icon-dom-dark',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroIconDomDarkPath',
      mimeCol: 'heroIconDomDarkMime',
      nameCol: 'heroIconDomDarkName',
      fallbackMime: 'image/png',
      label: 'Ícono Domingo Noche',
    })
  )
);
router.delete(
  '/icon-dom-dark',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroIconDomDarkPath',
      mimeCol: 'heroIconDomDarkMime',
      nameCol: 'heroIconDomDarkName',
      label: 'Ícono Domingo Noche',
    })
  )
);

router.post(
  '/icon-mier-light',
  upload.single('icon'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'imagen',
      mimePrefix: 'image/',
      defaultExt: '.png',
      filePrefix: 'hero-icon-mier-light',
      pathCol: 'heroIconMierLightPath',
      mimeCol: 'heroIconMierLightMime',
      nameCol: 'heroIconMierLightName',
      label: 'Ícono Miércoles Día',
    })
  )
);
router.get(
  '/icon-mier-light',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroIconMierLightPath',
      mimeCol: 'heroIconMierLightMime',
      nameCol: 'heroIconMierLightName',
      fallbackMime: 'image/png',
      label: 'Ícono Miércoles Día',
    })
  )
);
router.delete(
  '/icon-mier-light',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroIconMierLightPath',
      mimeCol: 'heroIconMierLightMime',
      nameCol: 'heroIconMierLightName',
      label: 'Ícono Miércoles Día',
    })
  )
);

router.post(
  '/icon-mier-dark',
  upload.single('icon'),
  asyncHandler((req, res) =>
    uploadHomeMedia(req, res, {
      kind: 'imagen',
      mimePrefix: 'image/',
      defaultExt: '.png',
      filePrefix: 'hero-icon-mier-dark',
      pathCol: 'heroIconMierDarkPath',
      mimeCol: 'heroIconMierDarkMime',
      nameCol: 'heroIconMierDarkName',
      label: 'Ícono Miércoles Noche',
    })
  )
);
router.get(
  '/icon-mier-dark',
  asyncHandler((req, res) =>
    getHomeMedia(req, res, {
      pathCol: 'heroIconMierDarkPath',
      mimeCol: 'heroIconMierDarkMime',
      nameCol: 'heroIconMierDarkName',
      fallbackMime: 'image/png',
      label: 'Ícono Miércoles Noche',
    })
  )
);
router.delete(
  '/icon-mier-dark',
  asyncHandler((req, res) =>
    deleteHomeMedia(req, res, {
      pathCol: 'heroIconMierDarkPath',
      mimeCol: 'heroIconMierDarkMime',
      nameCol: 'heroIconMierDarkName',
      label: 'Ícono Miércoles Noche',
    })
  )
);

// --- Card images ---
router.post(
  '/card-image/:index',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    const index = parseInt(req.params.index, 10);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const rel = saveFile('home', `card-${index}${ext}`, req.file.buffer);
    await dbRun(
      "INSERT INTO meeting_card_images (cardIndex, imagePath, imageMime, imageName) VALUES (?,?,?,?) ON CONFLICT(cardIndex) DO UPDATE SET imagePath=excluded.imagePath, imageMime=excluded.imageMime, imageName=excluded.imageName, updated_at=datetime('now')",
      [index, rel, req.file.mimetype, req.file.originalname]
    );
    res.json({ message: 'Imagen de card guardada', imageName: req.file.originalname, imageUrl: `/api/home/card-image/${index}` });
  })
);

router.get(
  '/card-image/:index',
  asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const row = await dbGet('SELECT imagePath, imageMime, imageName FROM meeting_card_images WHERE cardIndex = ?', [index]);
    if (!row || !row.imagePath) return res.status(404).json({ error: 'No hay imagen' });
    sendFile(res, resolvePath(row.imagePath), row.imageMime || 'image/jpeg', row.imageName);
  })
);

router.delete(
  '/card-image/:index',
  asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const row = await dbGet('SELECT imagePath FROM meeting_card_images WHERE cardIndex = ?', [index]);
    if (row?.imagePath) {
      const abs = resolvePath(row.imagePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await dbRun('DELETE FROM meeting_card_images WHERE cardIndex = ?', [index]);
    res.json({ message: 'Imagen eliminada' });
  })
);

// PATCH celebrations, meeting-days-summary, ministries-summary
router.patch(
  '/celebrations',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const celebrations = req.body.celebrations ?? [];
    await dbRun("UPDATE homes SET celebrations=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(celebrations), home.id]);
    res.json({ message: 'Celebraciones actualizadas' });
  })
);

router.patch(
  '/meeting-days-summary',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const data = req.body.meetingDaysSummary ?? parseJson(home.meetingDaysSummary);
    await dbRun("UPDATE homes SET meetingDaysSummary=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), home.id]);
    res.json({ message: 'Resumen de días de reunión actualizado' });
  })
);

router.patch(
  '/ministries-summary',
  asyncHandler(async (req, res) => {
    const home = await getHome();
    const data = req.body.ministriesSummary ?? parseJson(home.ministriesSummary);
    await dbRun("UPDATE homes SET ministriesSummary=?, updated_at=datetime('now') WHERE id=?", [stringifyJson(data), home.id]);
    res.json({ message: 'Resumen de ministerios actualizado' });
  })
);

export default router;
