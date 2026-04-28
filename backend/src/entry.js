process.stderr.write(`[entry] ${new Date().toISOString()} Node ${process.version} cwd=${process.cwd()} pid=${process.pid}\n`);

try {
  await import('./index.js');
} catch (err) {
  process.stderr.write(`[entry] FATAL al cargar index.js: ${err?.stack || err?.message || err}\n`);

  const fs = await import('fs');
  const msg = `${new Date().toISOString()} FATAL import: ${err?.stack || err?.message || err}\n`;
  for (const p of ['startup-debug.log', '/tmp/elvive-startup-debug.log']) {
    try {
      fs.appendFileSync(p, msg);
    } catch {
      void 0;
    }
  }

  process.exit(1);
}

