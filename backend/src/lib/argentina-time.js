/**
 * Día de la semana en zona horaria Argentina (America/Argentina/Buenos_Aires).
 * 1 = Lunes, 7 = Domingo.
 * Lunes(1), Martes(2), Miércoles(3) → video/icon "Miércoles"
 * Jueves(4) a Domingo(7) → video/icon "Domingo"
 */
export function getArgentinaDayOfWeek() {
  const now = new Date();
  const arg = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  return arg.getDay() === 0 ? 7 : arg.getDay(); // 1=Mon .. 7=Sun
}

export function isMiercolesTheme() {
  return getArgentinaDayOfWeek() <= 3; // Mon, Tue, Wed
}
