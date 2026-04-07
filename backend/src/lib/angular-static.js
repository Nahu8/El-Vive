import fs from 'fs';
import path from 'path';

/**
<<<<<<< Updated upstream
 * @param {string} serverSrcDir - Directorio donde está index.js del servidor: backend/src
 *   Desde ahí: ../.. = raíz del monorepo → frontend/dist/frontend/browser
=======
 * @param {string} serverSrcDir - backend/src (donde está index.js de Express)
 *
 * Monorepo: frontend/ hermano de backend/. Tras `npm run build` en backend: estáticos en ../public.
 *
 * Orden:
 * 1. ANGULAR_DIST
 * 2. ../public/browser — si quedó subcarpeta browser
 * 3. ../public — típico tras copy:spa (index en raíz)
 * 4. ../../frontend/dist/frontend/browser — sin copiar a public (desarrollo)
>>>>>>> Stashed changes
 */
export function resolveAngularStaticRoot(serverSrcDir) {
  const envPath = process.env.ANGULAR_DIST?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (fs.existsSync(path.join(resolved, 'index.html'))) return resolved;
    return null;
  }

  const monorepoBrowser = path.join(
    serverSrcDir,
    '..',
    '..',
    'frontend',
    'dist',
    'frontend',
    'browser'
  );
  if (fs.existsSync(path.join(monorepoBrowser, 'index.html'))) {
    return monorepoBrowser;
  }

  const backendPublic = path.join(serverSrcDir, '..', 'public');
<<<<<<< Updated upstream
  if (fs.existsSync(path.join(backendPublic, 'index.html'))) {
    return backendPublic;
  }
=======
  const fromPublic = dirWithIndex(backendPublic);
  if (fromPublic) return fromPublic;

  const siblingDist = path.join(serverSrcDir, '..', '..', 'frontend', 'dist', 'frontend', 'browser');
  const fromSibling = dirWithIndex(siblingDist);
  if (fromSibling) return fromSibling;
>>>>>>> Stashed changes

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
