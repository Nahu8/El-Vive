/**
 * Carga .env desde backend/.env aunque el cwd del proceso sea la raíz del monorepo (Hostinger).
 */
import { appendBootLog } from './lib/boot-file-log.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

appendBootLog('load-env: inicio (Node ejecutó este archivo)');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('[el-vive] cargando entorno…', new Date().toISOString());
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();
appendBootLog('load-env: dotenv listo');
