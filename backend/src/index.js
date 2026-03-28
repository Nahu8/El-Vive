import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth.js';
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
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db/index.js';
import { getUploadsDir } from './lib/uploads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Archivos subidos (imágenes, etc.) - público para previews
app.use('/uploads', express.static(path.join(getUploadsDir())));

// Rutas públicas (sin JWT)
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);

// Health sin auth
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente', database: 'SQLite' });
});

// GET que sirven archivos (imágenes/videos) son públicos; el resto de /api exige JWT
function isPublicApiGet(req) {
  if (req.method !== 'GET') return false;
  // Usamos originalUrl para tener el path completo bajo /api, sin querystring
  const p = (req.originalUrl || req.path || '').split('?')[0];
  if (p === '/api/health') return true;
  if ([
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
  ].includes(p)) return true;
  if (p.startsWith('/api/home/card-image/')) return true;
  if (p === '/api/meeting-days/hero-image') return true;
  if (/^\/api\/event\/[^/]+\/(icon|background)$/.test(p)) return true;
  if (/^\/api\/section-icon\/[^/]+\/[^/]+$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/(icon|card-image|pdf)$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/photo\/[^/]+$/.test(p)) return true;
  if (/^\/api\/ministry\/[^/]+\/video\/[^/]+$/.test(p)) return true;
  return false;
}

app.use('/api', (req, res, next) => {
  if (isPublicApiGet(req)) return next();
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

// 404
app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));

// Iniciar (getDb inicializa la BD)
getDb();

app.listen(PORT, () => {
  console.log(`Backend Él Vive (Node.js) escuchando en http://127.0.0.1:${PORT}`);
  console.log('  - Auth:     POST /auth/login');
  console.log('  - API:      /api/* (con JWT)');
  console.log('  - Público:  /public/*');
});
