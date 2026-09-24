import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { AuthService } from '@core/services/auth.service';

/**
 * Muestra el elemento solo si el usuario tiene el permiso (o todos los permisos de la lista).
 * Reacciona a cambios de sesión porque lee el signal currentUser de AuthService.
 *
 *   <button *appHasPermission="'PATIENT_UPDATE'" ...>Editar</button>
 *   <button *appHasPermission="['USER_READ', 'USER_UPDATE']" ...>...</button>
 *
 * Es solo UX: el backend valida cada permiso con @PreAuthorize.
 */
@Directive({
  selector: '[appHasPermission]',
})
export class HasPermission {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly appHasPermission = input.required<string | readonly string[]>();

  private rendered = false;

  constructor() {
    effect(() => {
      const required = this.appHasPermission();
      const permissions = typeof required === 'string' ? [required] : required;
      const allowed = permissions.every((permission) => this.authService.hasPermission(permission));

      if (allowed && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
