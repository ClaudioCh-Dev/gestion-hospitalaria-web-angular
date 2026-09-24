import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

// Con sesión, /login no tiene sentido: al inicio
export const guestGuard: CanMatchFn = () => {
  const authService = inject(AuthService);

  return authService.isAuthenticated()
    ? inject(Router).createUrlTree(['/'])
    : true;
};