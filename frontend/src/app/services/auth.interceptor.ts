import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

function isBackendRequest(url: string): boolean {
  const base = environment.apiBaseUrl;
  if (base) return url.startsWith(base);
  try {
    const resolved = new URL(url, typeof location !== 'undefined' ? location.origin : 'http://localhost');
    const p = resolved.pathname;
    return p.startsWith('/api') || p === '/auth' || p.startsWith('/auth/') || p.startsWith('/public');
  } catch {
    const path = url.split('?')[0];
    return /^(?:\/api\/|\/auth(?:\/|$)|\/public\/)/.test(path);
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token && isBackendRequest(req.url)) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

