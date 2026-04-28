import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function appendBootLog(line) {
  const text = typeof line === 'string' ? line : String(line);
  const entry = `${new Date().toISOString()} ${text}`;
  process.stderr.write(`[boot] ${entry}\n`);
  const candidates = [
    path.join(__dirname, '../../startup-debug.log'),
    path.join(process.cwd(), 'startup-debug.log'),
    '/tmp/elvive-startup-debug.log',
  ];
  for (const file of candidates) {
    try {
      fs.appendFileSync(file, `${entry}\n`);
      break;
    } catch {

    }
  }
}

