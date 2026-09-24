import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { TuiButton, TuiIcon, TuiInput, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading, TuiPassword } from '@taiga-ui/kit';

import { NotificationService } from '@core/services/alert-notification.service';
import { withNotification } from '@shared/operators/with-notification';

import { PASSWORD_PATTERN, PASSWORD_RULES } from '../../../user/constants/user-roles';
import { UserService } from '../../../user/services/user.service';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
  const { newPassword, confirmPassword } = group.value;

  return confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
};

@Component({
  selector: 'app-change-password-form',
  imports: [ReactiveFormsModule, TuiButton, TuiButtonLoading, TuiIcon, TuiInput, TuiLabel, TuiPassword, TuiTextfield],
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

  protected readonly saving = signal(false);

  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup(
    {
      currentPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),

      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
      }),

      confirmPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: passwordsMatch },
  );

  protected readonly newPassword = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  });

  protected get sameAsCurrent(): boolean {
    const { currentPassword, newPassword } = this.form.getRawValue();

    return !!newPassword && currentPassword === newPassword;
  }

  protected get mismatch(): boolean {
    return this.form.hasError('mismatch') && this.form.controls.confirmPassword.touched;
  }

  protected save(): void {
    this.submitted.set(true);

    if (this.form.invalid || this.sameAsCurrent) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.saving.set(true);

    this.userService
      .changePasswordMe({ currentPassword, newPassword })
      .pipe(
        withNotification(this.notificationService, {
          success: 'Contraseña actualizada. Vuelve a iniciar sesión con la nueva contraseña.',
        }),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.changed.emit();
        },
        error: () => this.saving.set(false),
      });
  }
}
