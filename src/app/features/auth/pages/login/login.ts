import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

import {
  TuiButton,
  TuiTextfield,
} from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiButton,
  ],
  templateUrl: './login.html',
})
export class Login {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  login(): void {

    this.authService.login({
      username: this.email,
      password: this.password,
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: error => {
        console.error('Error al iniciar sesión', error);
      },
    });
  }

  clearEmail(): void {
    this.email = '';
  }

  clearPassword(): void {
    this.password = '';
  }
}