/**
 * Ya no hace falta para el flujo normal: `ng build` escribe en `backend/public/browser`
 * (angular.json → outputPath `../public`).
 *
 * Si ejecutás este script por costumbre, solo avisa.
 */
console.log(
  '[copy:spa] Obsoleto: el front ya se genera en backend/public/browser con npm run build:frontend.'
);
process.exit(0);
