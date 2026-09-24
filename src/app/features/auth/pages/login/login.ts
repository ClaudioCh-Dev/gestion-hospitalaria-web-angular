import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TuiButton, TuiIcon, TuiInput, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading, TuiPassword } from '@taiga-ui/kit';

import { AuthService } from '@core/services/auth.service';

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    TuiButton,
    TuiButtonLoading,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiPassword,
    TuiTextfield,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly year = new Date().getFullYear();

  protected readonly errorMessage = signal<string | null>(null);

  // =========================
  // FORMULARIO (Signal Forms)
  // =========================

  private readonly credentials = signal({ email: '', password: '' });

  protected readonly form = form(this.credentials, (path) => {
    required(path.email, { message: 'Este campo es obligatorio' });
    email(path.email, { message: 'Ingresa un correo válido' });
    required(path.password, { message: 'Este campo es obligatorio' });
  });

  protected readonly highlights: Highlight[] = [
    {
      icon: '@tui.calendar-check',
      title: 'Agenda médica',
      description: 'Citas por médico y por día, con estados en tiempo real.',
    },
    {
      icon: '@tui.file-heart',
      title: 'Historial clínico',
      description: 'Cada atención registrada y disponible al instante.',
    },
    {
      icon: '@tui.wallet',
      title: 'Facturación',
      description: 'Cobros, tarifas y resúmenes siempre al día.',
    },
    {
      icon: '@tui.users',
      title: 'Gestión de personal',
      description: 'Controla horarios, roles y permisos de cada miembro del equipo.',
    },
  ];

  // submit() marca todo como tocado, solo ejecuta la acción si es válido
  // y deja form().submitting() en true mientras dura (loading del botón)
  protected async login(): Promise<void> {
    this.errorMessage.set(null);

    await submit(this.form, async () => {
      const { email, password } = this.credentials();

      try {
        await firstValueFrom(this.authService.login({ username: email, password }));

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        // Solo rutas internas: evita redirecciones abiertas (returnUrl=https://otro-sitio)
        this.router.navigateByUrl(
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/',
        );
      } catch (error) {
        // Contraseña vacía y sin "tocado", para no mostrar "obligatorio" junto al error
        this.form.password().reset('');
        this.errorMessage.set(this.toMessage(error as HttpErrorResponse));
      }
    });
  }

  // Primer error de un campo ya tocado
  protected fieldError(field: 'email' | 'password'): string | null {
    const state = this.form[field]();

    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  }

  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Inténtalo en unos minutos.';
    }

    if (error.status === 401 || error.status === 400) {
      return 'Correo o contraseña incorrectos.';
    }

    return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
  }
}
