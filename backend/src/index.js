import './load-env.js';
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

try {
  validateEnv();
} catch (e) {
  console.error('[startup] Variables de entorno:', e?.message || e);
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
console.log(
  '[startup] Express',
  JSON.stringify({
    node: process.version,
    cwd: process.cwd(),
    port: PORT,
    envPort: process.env.PORT ?? null,
  })
);

if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Angular en producción suele usar estilos/scripts que CSP estricto bloquea
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

app.use('/uploads', express.static(path.join(getUploadsDir())));

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

/** POST del formulario de contacto (sitio público, sin JWT). */
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

// Angular: después de API (no capturar /api con fallback). Build → frontend/dist/.../browser y copy:spa → backend/public/.
const spaRoot = resolveAngularStaticRoot(__dirname);
if (spaRoot) {
  app.use(express.static(spaRoot));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (isApiOrAssetPath(req.path)) return next();
    res.sendFile(path.join(spaRoot, 'index.html'), (err) => (err ? next(err) : undefined));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '[angular] No hay build del front (index.html). Subí el contenido de dist/.../browser a backend/public o definí ANGULAR_DIST.'
  );
}

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));

app.use((err, req, res, next) => {
  if (err && err.message === 'CORS: origen no permitido') {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

if (!skipDbInit) {
  try {
    if (useMysql()) {
      const h = process.env.DB_SOCKET_PATH?.trim() ? `socket:${process.env.DB_SOCKET_PATH}` : process.env.DB_HOST;
      console.log('[startup] Conectando MySQL…', { host: h, database: process.env.DB_NAME });
    }
    await initDatabase();
    if (useMysql()) console.log('[startup] MySQL listo (esquema comprobado).');
  } catch (err) {
    console.error('[startup] Falló la base de datos:', err?.message || err);
    if (err?.code) console.error('[startup] código MySQL:', err.code);
    console.error(
      '[startup] Si estás en Hostinger: revisá DB_USER/DB_PASSWORD en el panel, probá DB_HOST=127.0.0.1 o definí DB_SOCKET_PATH si hPanel indica socket Unix.'
    );
    process.exit(1);
  }
} else {
  console.warn(
    '[startup] SKIP_DB_INIT: arranque sin conectar BD (solo diagnóstico). Sacá esta variable después.'
  );
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Él Vive (Node.js) escuchando en 0.0.0.0:${PORT}`);
  console.log(`  - BD: ${useMysql() ? 'MySQL' : 'SQLite'}`);
  if (spaRoot) console.log(`  - Angular:  ${spaRoot}`);
  console.log('  - Auth:     POST /auth/login');
  console.log('  - API:      /api/* (con JWT)');
  console.log('  - Público:  /public/*');
});
server.on('error', (err) => {
  console.error('[startup] No se pudo abrir el puerto (¿PORT ocupado o sin permiso?):', err?.message || err);
  process.exit(1);
});
