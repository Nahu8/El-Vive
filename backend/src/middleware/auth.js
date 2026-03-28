import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elvive-iglesia-secret-2024';

/**
 * Middleware que exige JWT en Authorization: Bearer <token>.
 * Añade req.user = { id, username, role }.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Opcional: si hay token válido, pone req.user; si no, sigue sin usuario.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, role: payload.role };
  } catch {}
  next();
}

export function signToken(payload) {
  return jwt.sign(
    { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 8 * 3600 },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}
