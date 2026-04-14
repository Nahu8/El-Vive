// Bootstrap de compatibilidad para Hostinger.
// Mantiene el entrypoint en la raíz del repo y delega al backend ESM.

process.stderr.write(
  `[root-entry] ${new Date().toISOString()} Node ${process.version} cwd=${process.cwd()} pid=${process.pid}\n`
);

(async () => {
  try {
    await import('./backend/src/index.js');
  } catch (err) {
    const message = err && (err.stack || err.message) ? err.stack || err.message : String(err);
    process.stderr.write(`[root-entry] FATAL: ${message}\n`);

    try {
      const fs = require('fs');
      const line = `${new Date().toISOString()} FATAL root-entry: ${message}\n`;
      for (const file of ['startup-debug.log', '/tmp/elvive-startup-debug.log']) {
        try {
          fs.appendFileSync(file, line);
          break;
        } catch {}
      }
    } catch {}

    process.exit(1);
  }
})();
