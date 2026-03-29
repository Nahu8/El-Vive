import fs from 'fs';
import path from 'path';

function dirWithIndex(dir) {
  return fs.existsSync(path.join(dir, 'index.html')) ? dir : null;
}

/**
 * @param {string} serverSrcDir - backend/src (donde está index.js de Express)
 *
 * Orden (Hostinger, Root = backend):
 * 1. ANGULAR_DIST si está definido
 * 2. ../public/browser — salida de ng build con outputPath "../public" (application builder)
 * 3. ../public — si index.html está en la raíz (copia manual antigua)
 * 4. ../frontend/dist/frontend/browser — legado
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

  const legacyDist = path.join(serverSrcDir, '..', 'frontend', 'dist', 'frontend', 'browser');
  const fromLegacy = dirWithIndex(legacyDist);
  if (fromLegacy) return fromLegacy;

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
