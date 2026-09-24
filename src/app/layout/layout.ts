import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs';

import { TuiItem } from '@taiga-ui/cdk';
import { TuiBreadcrumbs, TuiFade } from '@taiga-ui/kit';

import { MENU_ITEMS } from './menu';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { AuthService } from '@core/services/auth.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Sidebar, Navbar, TuiBreadcrumbs, TuiFade, TuiItem, RouterLink, RouterOutlet],
  templateUrl: 'layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly authService = inject(AuthService);

  // Solo las opciones cuyo permiso tiene el usuario (los guards de ruta también lo exigen)
  protected readonly sidebarItems = computed(() =>
    MENU_ITEMS.filter((group) => this.authService.hasAnyPermission(group.item.permission)),
  );

  protected readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;

        const segments = url.split('/').filter(Boolean);

        if (segments.length < 2) {
          this.breadcrumbs.set([]);
          return;
        }

        this.breadcrumbs.set(
          segments.map((segment, index) => ({
            label: this.formatBreadcrumb(segment),
            url: '/' + segments.slice(0, index + 1).join('/'),
          })),
        );
      });
  }

  private formatBreadcrumb(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
