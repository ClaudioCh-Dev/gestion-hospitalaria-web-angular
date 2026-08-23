import { TuiRoot } from '@taiga-ui/core';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertNotification } from './shared/components/alert-notification/alert-notification';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TuiRoot,
    AlertNotification
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('gestion-hospitalaria-frontend');
}