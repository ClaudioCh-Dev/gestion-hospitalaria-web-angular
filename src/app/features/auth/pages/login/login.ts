import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiTextfield,
} from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    TuiTextfield,
    TuiButton,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected email = '';
  protected password = '';

  protected clearEmail(): void {
    this.email = '';
  }

  protected clearPassword(): void {
    this.password = '';
  }

  protected login(): void {
    console.log({
      email: this.email,
      password: this.password,
    });
  }
}