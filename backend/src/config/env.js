/**
 * Validación de variables de entorno (secretos nunca en el código ni en el frontend).
 */
export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).length < 32) {
      throw new Error(
        '[env] En producción JWT_SECRET es obligatorio y debe tener al menos 32 caracteres. Generá uno aleatorio y guardalo solo en .env en el servidor.'
      );
    }
    const cors = process.env.CORS_ORIGIN;
    if (!cors || !cors.trim()) {
      throw new Error(
        '[env] En producción definí CORS_ORIGIN con el/los orígenes del frontend (ej. https://tudominio.com). Separá varios con coma.'
      );
    }
  }

  if (process.env.DB_HOST?.trim()) {
    if (!process.env.DB_NAME?.trim()) throw new Error('[env] Con DB_HOST también necesitás DB_NAME.');
    if (process.env.DB_USER === undefined || process.env.DB_PASSWORD === undefined) {
      throw new Error('[env] Con MySQL definí DB_USER y DB_PASSWORD (pueden ser cadena vacía si tu hosting lo permite).');
    }
  }
}

/**
 * Orígenes permitidos para CORS (solo lista explícita en producción).
 */
export function getCorsOptions() {
  const raw = process.env.CORS_ORIGIN;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd || !raw?.trim()) {
    return { origin: true, credentials: false };
  }

  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (list.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: origen no permitido'));
    },
    credentials: false,
  };
}
