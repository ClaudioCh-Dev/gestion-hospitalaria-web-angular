import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { homeUrl } from './home';

// Uso: { path: 'users', canMatch: [permissionGuard], data: { permission: 'USER_READ' } }
// Con una lista basta con tener cualquiera: data: { permission: ['APPOINTMENT_READ', 'APPOINTMENT_READ_BY_DOCTOR'] }
export const permissionGuard: CanMatchFn = route => {
  const authService = inject(AuthService);
  const required = route.data?.['permission'] as string | string[] | undefined;
  const permissions = typeof required === 'string' ? [required] : required ?? [];

  if (!permissions.length || permissions.some(permission => authService.hasPermission(permission))) {
    return true;
  }

  // Sin permiso: a su página de inicio (el dashboard ya no es de todos)
  return inject(Router).parseUrl(homeUrl());
};