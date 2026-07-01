import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { catchError, map, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { MaintenanceService } from '../services/maintenance.service';

// ponytail: 4s cap — cold start en Hostinger no debe dejar router-outlet vacío (pantalla negra)
const MAINTENANCE_CHECK_MS = 4000;

export const maintenanceGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const maintenance = inject(MaintenanceService);

  const path = state.url.split('?')[0];

  if (path === '/login') {
    return true;
  }

  if (path.startsWith('/admin')) {
    return true;
  }

  if (path === '/mantenimiento') {
    return maintenance.checkNow$().pipe(
      timeout(MAINTENANCE_CHECK_MS),
      map((active) => {
        if (!active) {
          router.navigate(['/'], { replaceUrl: true });
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  return maintenance.checkNow$().pipe(
    timeout(MAINTENANCE_CHECK_MS),
    map((active) => {
      if (active) {
        router.navigate(['/mantenimiento'], { replaceUrl: true });
        return false;
      }
      return true;
    }),
    catchError(() => of(true))
  );
};

