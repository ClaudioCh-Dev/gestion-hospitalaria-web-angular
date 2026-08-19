import { TuiRoot } from '@taiga-ui/core';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TuiRoot
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('gestion-hospitalaria-frontend');
}