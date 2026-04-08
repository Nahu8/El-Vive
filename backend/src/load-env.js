/**
 * Carga .env desde backend/.env aunque el cwd del proceso sea la raíz del monorepo (Hostinger).
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('[el-vive] cargando entorno…', new Date().toISOString());
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();
