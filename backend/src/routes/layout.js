import { Router } from 'express';
import { dbGet, dbRun, parseJson, stringifyJson } from '../db/index.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

const defaultNav = [
  { label: 'Inicio', path: '/' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Ministerios', path: '/ministerios' },
  { label: 'Días de Reunión', path: '/dias-reunion' },
  { label: 'Donaciones', path: '/donaciones' },
  { label: 'Contacto', path: '/contacto' },
];
const defaultQuick = [
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Ministerios', path: '/ministerios' },
  { label: 'Días de Reunión', path: '/dias-reunion' },
  { label: 'Donaciones', path: '/donaciones' },
  { label: 'Contacto', path: '/contacto' },
];

async function getLayout() {
  let row = await dbGet('SELECT * FROM layouts LIMIT 1');
  if (!row) {
    await dbRun(
      `INSERT INTO layouts (navLinks, footerBrandTitle, footerBrandDescription, quickLinks)
       VALUES (?, ?, ?, ?)`,
      [stringifyJson(defaultNav), 'ÉL VIVE IGLESIA', 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.', stringifyJson(defaultQuick)]
    );
    row = await dbGet('SELECT * FROM layouts LIMIT 1');
  }
  return row;
}

function toNav(links) {
  if (Array.isArray(links) && links.length) return links;
  const parsed = parseJson(links);
  return Array.isArray(parsed) ? parsed : defaultNav;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const layout = await getLayout();
    const headerIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header']);
    const headerIconLight = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header-light']);
    const headerIconDark = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'header-dark']);
    const footerIcon = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer']);
    const footerIconLight = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer-light']);
    const footerIconDark = await dbGet('SELECT 1 FROM section_icons WHERE page_key=? AND section_key=?', ['layout', 'footer-dark']);
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
  })
);

const putLayout = asyncHandler(async (req, res) => {
  const layout = await getLayout();
  const body = req.body || {};
  const fields = [
    'navLinks',
    'footerBrandTitle',
    'footerBrandDescription',
    'footerFacebookUrl',
    'footerInstagramUrl',
    'footerYoutubeUrl',
    'footerAddress',
    'footerEmail',
    'footerPhone',
    'footerCopyright',
    'footerPrivacyUrl',
    'footerTermsUrl',
    'quickLinks',
    'whatsappNumber',
  ];
  for (const f of fields) {
    if (body[f] !== undefined) {
      const val = typeof body[f] === 'object' ? stringifyJson(body[f]) : body[f];
      await dbRun(`UPDATE layouts SET ${f}=?, updated_at=datetime('now') WHERE id=?`, [val, layout.id]);
    }
  }
  const updated = await dbGet('SELECT * FROM layouts WHERE id=?', [layout.id]);
  res.json(updated);
});

router.put('/', putLayout);
router.patch('/', putLayout);

export default router;
