import fs from 'fs';
import path from 'path';

/**
 * @param {string} serverSrcDir - Directorio donde está index.js del servidor: backend/src
 *   Angular vive en backend/frontend → dist en backend/frontend/dist/frontend/browser
 */
export function resolveAngularStaticRoot(serverSrcDir) {
  const envPath = process.env.ANGULAR_DIST?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (fs.existsSync(path.join(resolved, 'index.html'))) return resolved;
    return null;
  }

  const monorepoBrowser = path.join(serverSrcDir, '..', 'frontend', 'dist', 'frontend', 'browser');
  if (fs.existsSync(path.join(monorepoBrowser, 'index.html'))) {
    return monorepoBrowser;
  }

  const backendPublic = path.join(serverSrcDir, '..', 'public');
  if (fs.existsSync(path.join(backendPublic, 'index.html'))) {
    return backendPublic;
  }

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
