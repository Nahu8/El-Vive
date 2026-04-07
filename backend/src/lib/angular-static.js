import fs from 'fs';
import path from 'path';

function dirWithIndex(dir) {
  return fs.existsSync(path.join(dir, 'index.html')) ? dir : null;
}

/**
 * @param {string} serverSrcDir - backend/src (donde está index.js de Express)
 *
 * Monorepo: frontend/ hermano de backend/. Tras `npm run build` en backend: estáticos en ../public.
 *
 * Orden:
 * 1. ANGULAR_DIST
 * 2. ../public/browser — si quedó subcarpeta browser
 * 3. ../public — típico tras copy:spa (index en raíz)
 * 4. ../../frontend/dist/frontend/browser — sin copiar a public (desarrollo)
 */
export function resolveAngularStaticRoot(serverSrcDir) {
  const envPath = process.env.ANGULAR_DIST?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    const withIndex = dirWithIndex(resolved);
    if (withIndex) return withIndex;
    return null;
  }

  const publicBrowser = path.join(serverSrcDir, '..', 'public', 'browser');
  const fromPublicBrowser = dirWithIndex(publicBrowser);
  if (fromPublicBrowser) return fromPublicBrowser;

  const backendPublic = path.join(serverSrcDir, '..', 'public');
  const fromPublic = dirWithIndex(backendPublic);
  if (fromPublic) return fromPublic;

  const siblingDist = path.join(serverSrcDir, '..', '..', 'frontend', 'dist', 'frontend', 'browser');
  const fromSibling = dirWithIndex(siblingDist);
  if (fromSibling) return fromSibling;

  return null;
}

export function isApiOrAssetPath(reqPath) {
  const p = reqPath.startsWith('/') ? reqPath : `/${reqPath}`;
  return (
    p.startsWith('/api') ||
    p.startsWith('/auth') ||
    p.startsWith('/public') ||
    p.startsWith('/uploads')
  );
}
