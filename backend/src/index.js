import './load-env.js';
import { appendBootLog } from './lib/boot-file-log.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import { validateEnv, getCorsOptions } from './config/env.js';
import { initDatabase, useMysql } from './db/index.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import homeRoutes from './routes/home.js';
import meetingDaysRoutes from './routes/meeting-days.js';
import eventMediaRoutes from './routes/event-media.js';
import sectionIconRoutes from './routes/section-icon.js';
import contactInfoRoutes from './routes/contact-info.js';
import layoutRoutes from './routes/layout.js';
import eventsRoutes from './routes/events.js';
import ministriesCrudRoutes from './routes/ministries-crud.js';
import ministriesContentRoutes from './routes/ministries-content.js';
import contactMessagesRoutes from './routes/contact-messages.js';
import ministryMediaRoutes from './routes/ministry-media.js';
import mediaRoutes from './routes/media.js';
import genericPagesRoutes from './routes/generic-pages.js';
import { getUploadsDir } from './lib/uploads.js';
import { resolveAngularStaticRoot, isApiOrAssetPath } from './lib/angular-static.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.on('uncaughtException', (err) => {
  appendBootLog(`uncaughtException: ${err?.stack || err?.message || err}`);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  appendBootLog(`unhandledRejection: ${reason?.stack || reason?.message || String(reason)}`);
});

try {
  validateEnv();
  appendBootLog('validateEnv: ok');
} catch (e) {
  appendBootLog(`validateEnv: FALLO ${e?.message || e}`);
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Probá de nuevo más tarde.' },
});

app.use('/uploads', express.static(path.join(getUploadsDir()), {
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  },
}));

app.use('/auth', authLimiter, authRoutes);
app.use('/public', publicRoutes);

const skipDbInit =
  process.env.SKIP_DB_INIT === '1' || String(process.env.SKIP_DB_INIT || '').toLowerCase() === 'true';

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando correctamente',
    database: useMysql() ? 'mysql' : 'sqlite',
    ...(skipDbInit && { dbInitSkipped: true }),
  });
});

function isPublicApiGet(req) {
  if (req.method !== 'GET') return false;
  const p = (req.originalUrl || req.path || '').split('?')[0];
  if (p === '/api/health') return true;
  if (
    [
      '/api/home/current-video',
      '/api/home/current-icon',
      '/api/home/video',
      '/api/home/video2',
      '/api/home/icon-dom',
      '/api/home/icon-mier',
      '/api/home/video-light',
      '/api/home/video-dark',
      '/api/home/icon-light',
      '/api/home/icon-dark',
      '/api/home/video-dom-light',
      '/api/home/video-dom-dark',
      '/api/home/video-mier-light',
      '/api/home/video-mier-dark',
      '/api/home/icon-dom-light',
      '/api/home/icon-dom-dark',
      '/api/home/icon-mier-light',
      '/api/home/icon-mier-dark',
    ].includes(p)
  )
    return true;
  if (p.startsWith('/api/home/card-image/')) return true;
  if (p === '/api/meeting-days/hero-image') return true;
  if (/^\/api\/event\/[^/]+\/(icon|background)$/.test(p)) return true;
  if (/^\/api\/section-icon\/[^/]+\/[^/]+$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/(icon|card-image|pdf)$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/photo\/[^/]+$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/video\/[^/]+$/.test(p)) return true;
  return false;
}

function isPublicContactPost(req) {
  if (req.method !== 'POST') return false;
  const p = (req.originalUrl || req.path || '').split('?')[0];
  return p === '/api/contact' || p === '/api/contact/';
}

app.use('/api', (req, res, next) => {
  if (isPublicApiGet(req) || isPublicContactPost(req)) return next();
  return requireAuth(req, res, next);
});

app.use('/api/home', homeRoutes);
app.use('/api/meeting-days', meetingDaysRoutes);
app.use('/api/event/:eventId', eventMediaRoutes);
app.use('/api/section-icon/:pageKey/:sectionKey', sectionIconRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/layout', layoutRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/ministries', ministriesCrudRoutes);
app.use('/api/ministries-content', ministriesContentRoutes);
app.use('/api/contact', contactMessagesRoutes);
app.use('/api/ministry/:ministryId', ministryMediaRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/generic-pages', genericPagesRoutes);

const spaRoot = resolveAngularStaticRoot(__dirname);

const SITEMAP_PATHS = ['/', '/nosotros', '/ministerios', '/dias-reunion', '/donaciones', '/contacto'];

app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const urls = SITEMAP_PATHS.map(
    (p) => `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>`
  ).join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

if (spaRoot) {
  app.use(express.static(spaRoot));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (isApiOrAssetPath(req.path)) return next();
    res.sendFile(path.join(spaRoot, 'index.html'), (err) => (err ? next(err) : undefined));
  });
} else if (process.env.NODE_ENV === 'production') {
  appendBootLog('[angular] No hay build del front (index.html).');
}

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));

app.use((err, req, res, next) => {
  if (err && err.message === 'CORS: origen no permitido') {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

if (!skipDbInit) {
  try {
    await initDatabase();
    appendBootLog('initDatabase: ok');
  } catch (err) {
    appendBootLog(`initDatabase: FALLO ${err?.message || err} code=${err?.code || ''}`);
    process.exit(1);
  }
} else {
  appendBootLog('initDatabase: omitido (SKIP_DB_INIT)');
}

const server = app.listen(PORT, '0.0.0.0', () => {
  appendBootLog(
    `listen: OK 0.0.0.0:${PORT} bd=${useMysql() ? 'mysql' : 'sqlite'} spa=${spaRoot || '—'} cwd=${process.cwd()}`
  );
});
server.on('error', (err) => {
  appendBootLog(`listen: ERROR ${err?.message || err}`);
  process.exit(1);
});

