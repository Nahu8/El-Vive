import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (isAuth && user) {
    return true;
  }

  sessionStorage.removeItem('currentUser');
  router.navigate(['/login']);
  return false;
};

