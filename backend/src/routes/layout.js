import { Router } from 'express';
import { getDb, parseJson, stringifyJson } from '../db/index.js';

const router = Router();

const defaultNav = [{ label: 'Inicio', path: '/' }, { label: 'Nosotros', path: '/nosotros' }, { label: 'Ministerios', path: '/ministerios' }, { label: 'Días de Reunión', path: '/dias-reunion' }, { label: 'Donaciones', path: '/donaciones' }, { label: 'Contacto', path: '/contacto' }];
const defaultQuick = [{ label: 'Nosotros', path: '/nosotros' }, { label: 'Ministerios', path: '/ministerios' }, { label: 'Días de Reunión', path: '/dias-reunion' }, { label: 'Donaciones', path: '/donaciones' }, { label: 'Contacto', path: '/contacto' }];

function getLayout() {
  const db = getDb();
  let row = db.prepare('SELECT * FROM layouts LIMIT 1').get();
  if (!row) {
    db.prepare(
      `INSERT INTO layouts (navLinks, footerBrandTitle, footerBrandDescription, quickLinks)
       VALUES (?, ?, ?, ?)`
    ).run(stringifyJson(defaultNav), 'ÉL VIVE IGLESIA', 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.', stringifyJson(defaultQuick));
    row = db.prepare('SELECT * FROM layouts LIMIT 1').get();
  }
  return row;
}

function toNav(links) {
  if (Array.isArray(links) && links.length) return links;
  const parsed = parseJson(links);
  return Array.isArray(parsed) ? parsed : defaultNav;
}

router.get('/', (req, res) => {
  const db = getDb();
  const layout = getLayout();
  const headerIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header');
  const headerIconLight = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header-light');
  const headerIconDark = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'header-dark');
  const footerIcon = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer');
  const footerIconLight = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer-light');
  const footerIconDark = db.prepare('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?').get('layout', 'footer-dark');
  res.json({
    id: layout.id,
    navLinks: toNav(layout.navLinks),
    footerBrandTitle: layout.footerBrandTitle ?? '',
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
    quickLinks: toNav(layout.quickLinks),
    whatsappNumber: layout.whatsappNumber ?? '',
    headerIconUrl: headerIcon ? '/api/section-icon/layout/header' : null,
    headerIconUrlLight: headerIconLight ? '/api/section-icon/layout/header-light' : null,
    headerIconUrlDark: headerIconDark ? '/api/section-icon/layout/header-dark' : null,
    footerIconUrl: footerIcon ? '/api/section-icon/layout/footer' : null,
    footerIconUrlLight: footerIconLight ? '/api/section-icon/layout/footer-light' : null,
    footerIconUrlDark: footerIconDark ? '/api/section-icon/layout/footer-dark' : null,
  });
});

router.put('/', (req, res) => {
  const layout = getLayout();
  const body = req.body || {};
  const fields = ['navLinks', 'footerBrandTitle', 'footerBrandDescription', 'footerFacebookUrl', 'footerInstagramUrl', 'footerYoutubeUrl', 'footerAddress', 'footerEmail', 'footerPhone', 'footerCopyright', 'footerPrivacyUrl', 'footerTermsUrl', 'quickLinks', 'whatsappNumber'];
  const db = getDb();
  for (const f of fields) {
    if (body[f] !== undefined) {
      const val = typeof body[f] === 'object' ? stringifyJson(body[f]) : body[f];
      db.prepare(`UPDATE layouts SET ${f}=?, updated_at=datetime('now') WHERE id=?`).run(val, layout.id);
    }
  }
  res.json(getDb().prepare('SELECT * FROM layouts WHERE id=?').get(layout.id));
});

router.patch('/', (req, res) => {
  return router.put(req, res);
});

export default router;
