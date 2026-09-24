import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Contrato del auth-server simulado. Solo la interfaz y el token viven aquí para que
 * AuthService pueda pedirlo sin importar la implementación (AuthMockStore), que así
 * no entra en el bundle de producción.
 */
export interface AuthMockBackend {
  login(email: string, password: string): Observable<{ accessToken: string }>;

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<void>;
}

// Solo se provee en data-providers.mock.ts; en producción no existe (inject opcional → null)
export const AUTH_MOCK_BACKEND = new InjectionToken<AuthMockBackend>('AUTH_MOCK_BACKEND');
