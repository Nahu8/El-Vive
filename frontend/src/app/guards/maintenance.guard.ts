import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { MaintenanceService } from '../services/maintenance.service';

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
      map((active) => {
        if (!active) {
          router.navigate(['/'], { replaceUrl: true });
          return false;
        }
        return true;
      })
    );
  }

  return maintenance.checkNow$().pipe(
    map((active) => {
      if (active) {
        router.navigate(['/mantenimiento'], { replaceUrl: true });
        return false;
      }
      return true;
    })
  );
};

