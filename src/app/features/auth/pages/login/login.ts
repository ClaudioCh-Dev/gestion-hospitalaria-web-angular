import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  TuiButton,
  TuiError,
  TuiIcon,
  TuiInput,
  TuiLabel,
  TuiTextfield,
  tuiValidationErrorsProvider,
} from '@taiga-ui/core';
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
    ReactiveFormsModule,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiPassword,
    TuiTextfield,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiValidationErrorsProvider({
      required: 'Este campo es obligatorio',
      email: 'Ingresa un correo válido',
    }),
  ],
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly year = new Date().getFullYear();

  protected readonly loading = signal(false);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
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

  protected login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/',
        );
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.form.controls.password.reset();
        this.errorMessage.set(this.toMessage(error));
      },
    });
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
