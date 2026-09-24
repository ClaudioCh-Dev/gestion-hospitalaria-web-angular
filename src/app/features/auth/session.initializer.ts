import { inject } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';

// Al arrancar: si hay cookie de refresh, recupera el access token antes de navegar.
// Si falla (no hay cookie, expiró o estamos en modo mock) se sigue sin sesión.
export function restoreSession(): Promise<unknown> {
  const authService = inject(AuthService);

  return firstValueFrom(
    authService.refreshToken().pipe(catchError(() => of(null))),
  );
}