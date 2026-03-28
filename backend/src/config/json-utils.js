export function parseJson(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object' && !Buffer.isBuffer(value)) return value;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

export function stringifyJson(value) {
  if (value == null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}
