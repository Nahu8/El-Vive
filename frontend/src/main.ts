import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  console.error('[Él Vive] No se pudo iniciar la aplicación:', err);
  const shell = document.getElementById('app-shell-fallback');
  if (shell) shell.hidden = false;
});

