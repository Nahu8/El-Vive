import { appendBootLog } from './lib/boot-file-log.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

appendBootLog('load-env: inicio (Node ejecutó este archivo)');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();
appendBootLog('load-env: dotenv listo');

