import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Carpeta con el output de `ng build` (contenido de dist/.../browser, con index.html).
 * Orden: ANGULAR_DIST → monorepo frontend/dist/.../browser → backend/public
 */
export function resolveAngularStaticRoot() {
  const envPath = process.env.ANGULAR_DIST?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    if (fs.existsSync(path.join(resolved, 'index.html'))) return resolved;
    return null;
  }
  const monorepoBrowser = path.join(__dirname, '../../../frontend/dist/frontend/browser');
  if (fs.existsSync(path.join(monorepoBrowser, 'index.html'))) {
    return monorepoBrowser;
  }
  const backendPublic = path.join(__dirname, '../../public');
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
