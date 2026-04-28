export function getArgentinaDayOfWeek() {
  const now = new Date();
  const arg = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  return arg.getDay() === 0 ? 7 : arg.getDay();
}

export function isMiercolesTheme() {
  return getArgentinaDayOfWeek() <= 3;
}

