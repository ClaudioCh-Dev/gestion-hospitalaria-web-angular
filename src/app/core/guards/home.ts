import { inject } from '@angular/core';

import { AuthService } from '@core/services/auth.service';

// Página de inicio según permisos, en orden de preferencia
const HOME_CANDIDATES: { url: string; permissions: string[] }[] = [
  { url: '/dashboard', permissions: ['DASHBOARD_READ'] },
  { url: '/appointments', permissions: ['APPOINTMENT_READ', 'APPOINTMENT_READ_BY_DOCTOR'] },
  { url: '/patients', permissions: ['PATIENT_READ'] },
];

/**
 * Primera página a la que el usuario tiene acceso (admin → dashboard, médico → su agenda,
 * cualquier otro → bienvenida).
 * Se usa en redirectTo de las rutas y como destino del permissionGuard.
 * Debe llamarse en un contexto de inyección.
 */
export function homeUrl(): string {
  const authService = inject(AuthService);

  const home = HOME_CANDIDATES.find(candidate => authService.hasAnyPermission(candidate.permissions));

  // Sin ninguna: la bienvenida (no exige permiso, así nunca hay bucle de redirecciones)
  return home?.url ?? '/welcome';
}
