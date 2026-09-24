import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormField, form, pattern, required, submit, validate } from '@angular/forms/signals';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TuiButton, TuiIcon, TuiInput, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading, TuiPassword } from '@taiga-ui/kit';

import { UserService } from '../../../user/services/user.service';
import { PASSWORD_PATTERN, PASSWORD_RULES } from '../../../user/constants/user-roles';

// form: crear contraseña · success: activada · invalid: token inexistente/usado · expired: pasaron 24 h
type ActivationStatus = 'form' | 'success' | 'invalid' | 'expired';

interface ActivationModel {
  password: string;
  confirmPassword: string;
}

/**
 * Página pública del enlace del correo: {frontendUrl}/activate?token=...
 * El usuario crea su contraseña y la cuenta queda activa (POST /auth-server/users/activate).
 * Formulario con Signal Forms (@angular/forms/signals).
 */
@Component({
  selector: 'app-activate-account',
  imports: [
    FormField,
    NgTemplateOutlet,
    RouterLink,

    // Taiga UI
    TuiButton,
    TuiButtonLoading,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiPassword,
    TuiTextfield,
  ],
  templateUrl: './activate-account.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateAccount {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // Token del enlace del correo (?token=...)
  private readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly rules = PASSWORD_RULES;

  // Sin token en la URL el enlace no sirve: se muestra directamente como inválido
  protected readonly status = signal<ActivationStatus>(this.token ? 'form' : 'invalid');

  // Errores que no cambian de pantalla (validación del backend, red...)
  protected readonly errorMessage = signal<string | null>(null);

  // =========================
  // FORMULARIO (Signal Forms)
  // =========================

  private readonly model = signal<ActivationModel>({ password: '', confirmPassword: '' });

  protected readonly form = form(this.model, (path) => {
    required(path.password, { message: 'Ingresa una contraseña' });
    // Misma regla que valida auth-server
    pattern(path.password, PASSWORD_PATTERN, { message: 'La contraseña no cumple los requisitos' });

    required(path.confirmPassword, { message: 'Confirma la contraseña' });
    validate(path.confirmPassword, ({ value, valueOf }) =>
      value() && value() !== valueOf(path.password)
        ? { kind: 'mismatch', message: 'Las contraseñas no coinciden' }
        : undefined,
    );
  });

  // submit() marca todo como tocado, solo ejecuta la acción si el formulario es válido
  // y mantiene form().submitting() en true mientras dura (se usa para el loading del botón)
  protected async activate(): Promise<void> {
    this.errorMessage.set(null);

    await submit(this.form, async () => {
      if (!this.token) {
        this.status.set('invalid');
        return;
      }

      try {
        await firstValueFrom(
          this.userService.activate({ token: this.token, password: this.model().password }),
        );

        this.status.set('success');
      } catch (error) {
        this.handleError(error as HttpErrorResponse);
      }
    });
  }

  // Primer error de un campo ya tocado (para mostrar debajo del input)
  protected fieldError(field: 'password' | 'confirmPassword'): string | null {
    const state = this.form[field]();

    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse): void {
    const code = (error.error as { code?: string } | null)?.code;

    if (code === 'INVALID_ACTIVATION_TOKEN') {
      this.status.set('invalid');
    } else if (code === 'ACTIVATION_TOKEN_EXPIRED') {
      this.status.set('expired');
    } else if (error.status === 0) {
      this.errorMessage.set('No se pudo conectar con el servidor. Inténtalo en unos minutos.');
    } else if (error.status === 400) {
      this.errorMessage.set('La contraseña no cumple los requisitos. Revísala e inténtalo de nuevo.');
    } else {
      this.errorMessage.set('No se pudo activar la cuenta. Inténtalo nuevamente.');
    }
  }
}
