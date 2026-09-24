import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

// Sin sesión → /login?returnUrl=<a dónde quería ir>
export const authGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const returnUrl = '/' + segments.map(segment => segment.path).join('/');

  return router.createUrlTree(['/login'], {
    queryParams: returnUrl !== '/' ? { returnUrl } : {},
  });
};