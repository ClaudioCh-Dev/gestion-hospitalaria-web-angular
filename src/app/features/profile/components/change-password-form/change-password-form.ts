import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormField, form, pattern, required, submit, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { TuiButton, TuiIcon, TuiInput, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading, TuiPassword } from '@taiga-ui/kit';

import { NotificationService } from '@core/services/alert-notification.service';
import { withNotification } from '@shared/operators/with-notification';

import { PASSWORD_PATTERN, PASSWORD_RULES } from '../../../user/constants/user-roles';
import { UserService } from '../../../user/services/user.service';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

@Component({
  selector: 'app-change-password-form',
  imports: [FormField, TuiButton, TuiButtonLoading, TuiIcon, TuiInput, TuiLabel, TuiPassword, TuiTextfield],
  templateUrl: './change-password-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordForm {
  private readonly userService = inject(UserService);

  private readonly notificationService = inject(NotificationService);

  readonly cancel = output<void>();

  // El backend revoca todas las sesiones al cambiarla: el padre cierra sesión
  readonly changed = output<void>();

  protected readonly rules = PASSWORD_RULES;

  // =========================
  // FORMULARIO (Signal Forms)
  // =========================

  private readonly model = signal({ currentPassword: '', newPassword: '', confirmPassword: '' });

  protected readonly form = form(this.model, (path) => {
    required(path.currentPassword, { message: 'Ingresa tu contraseña actual' });

    required(path.newPassword, { message: 'Ingresa la nueva contraseña' });
    // Misma regla que valida auth-server
    pattern(path.newPassword, PASSWORD_PATTERN, { message: 'La contraseña no cumple los requisitos' });
    validate(path.newPassword, ({ value, valueOf }) =>
      value() && value() === valueOf(path.currentPassword)
        ? { kind: 'sameAsCurrent', message: 'La nueva contraseña debe ser distinta de la actual' }
        : undefined,
    );

    required(path.confirmPassword, { message: 'Confirma la nueva contraseña' });
    validate(path.confirmPassword, ({ value, valueOf }) =>
      value() && value() !== valueOf(path.newPassword)
        ? { kind: 'mismatch', message: 'Las contraseñas no coinciden' }
        : undefined,
    );
  });

  // submit() marca todo como tocado, solo ejecuta la acción si es válido
  // y deja form().submitting() en true mientras dura (loading del botón)
  protected async save(): Promise<void> {
    await submit(this.form, async () => {
      const { currentPassword, newPassword } = this.model();

      try {
        await firstValueFrom(
          this.userService.changePasswordMe({ currentPassword, newPassword }).pipe(
            withNotification(this.notificationService, {
              success: 'Contraseña actualizada. Vuelve a iniciar sesión con la nueva contraseña.',
            }),
          ),
        );

        this.changed.emit();
      } catch {
        // withNotification ya muestra el error del backend (p. ej. contraseña actual incorrecta)
      }
    });
  }

  // Primer error de un campo ya tocado
  protected fieldError(field: PasswordField): string | null {
    const state = this.form[field]();

    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  }
}
