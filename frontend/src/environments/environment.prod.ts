/**
 * Producción: se inyecta vía fileReplacements en angular.json (build --configuration production).
 *
 * apiBaseUrl sin barra final:
 * - '' → mismo dominio que el sitio (reverse proxy o Node sirviendo /api, /public, /auth)
 * - 'https://api.tudominio.com' → backend en otro host (actualizá CORS_ORIGIN en el servidor Node)
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
