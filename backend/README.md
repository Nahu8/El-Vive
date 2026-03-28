# Backend Él Vive Iglesia (Node.js)

API REST en Node.js (Express) que reemplaza al backend Laravel (PHP). Compatible con el frontend Angular existente.

## Requisitos

- Node.js 18+

## Instalación

```bash
cd backend
npm install
npm run init-db
```

## Uso

```bash
npm start
# o en desarrollo con recarga:
npm run dev
```

El servidor escucha en **http://127.0.0.1:3000** (mismo puerto que usa el frontend).

### Usuario por defecto

Tras `npm run init-db` se crea un usuario:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

(Conviene cambiar la contraseña en producción.)

## Variables de entorno

- `PORT`: Puerto (por defecto 3000)
- `JWT_SECRET`: Secreto para JWT (por defecto `elvive-iglesia-secret-2024`)
- `DB_PATH`: Ruta del archivo SQLite (por defecto `data/elvive.db`)
- `UPLOADS_DIR`: Carpeta de subidas (por defecto `uploads/`)

## Endpoints

- **Auth:** `POST /auth/login` (body: `{ "username", "password" }`)
- **API (con JWT):** `/api/home`, `/api/meeting-days`, `/api/contact-info`, `/api/layout`, `/api/events`, `/api/ministries`, `/api/contact`, `/api/ministries-content`, `/api/ministry/:id/*`, `/api/media`, etc.
- **Públicos (sin JWT):** `/public/config/home`, `/public/config/contact`, `/public/config/layout`, `/public/config/ministries`, `/public/config/meeting-days`, `/public/events/upcoming`, `/public/events/calendar`
- Las rutas GET que sirven archivos (videos, iconos, imágenes) bajo `/api/` son públicas para que el sitio pueda mostrarlas.

## Base de datos

SQLite en `data/elvive.db`. Los archivos subidos (videos, imágenes) se guardan en la carpeta `uploads/`.
