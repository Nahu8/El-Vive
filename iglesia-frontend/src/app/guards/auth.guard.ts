import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard - Verificando autenticación...');
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  console.log('Is authenticated:', isAuth);
  console.log('Current user:', user);
  console.log('URL solicitada:', state.url);
  console.log('SessionStorage currentUser:', sessionStorage.getItem('currentUser'));

  // Verificar tanto el estado como el usuario
  if (isAuth && user) {
    console.log('AuthGuard - Acceso permitido');
    return true;
  }
  
  console.log('AuthGuard - Acceso denegado, redirigiendo a login');
  // Limpiar cualquier estado inconsistente
  sessionStorage.removeItem('currentUser');
  router.navigate(['/login']);
  return false;
};
