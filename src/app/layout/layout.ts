import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';

import {filter} from 'rxjs';

import {TuiItem} from '@taiga-ui/cdk';
import {TuiBreadcrumbs, TuiFade} from '@taiga-ui/kit';

import {SidebarGroup} from './types';
import {Sidebar} from './sidebar/sidebar';
import {Navbar} from './navbar/navbar';
import {AuthService} from '@core/services/auth.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Sidebar,
    Navbar,
    TuiBreadcrumbs,
    TuiFade,
    TuiItem,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: 'layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {

  private readonly authService = inject(AuthService);

  private readonly baseSidebarItems: SidebarGroup[] = [
    {
      item: {
        label: 'Dashboard',
        icon: '@tui.layout-dashboard',
        route: '/dashboard',
      },
    },
    {
      item: {
        label: 'Pacientes',
        icon: '@tui.users',
        route: '/patients',
      },
    },
    {
      item: {
        label: 'Médicos',
        icon: '@tui.stethoscope',
        route: '/doctors',
      },
    },
    {
      item: {
        label: 'Citas',
        icon: '@tui.calendar',
        route: '/appointments',
      },
    },
    {
      item: {
        label: 'Tipos de cita',
        icon: '@tui.tag',
        route: '/appointment-types',
      },
    },
    {
      item: {
        label: 'Historias clínicas',
        icon: '@tui.file-text',
        route: '/medical-records',
      },
    },
    {
      item: {
        label: 'Facturación',
        icon: '@tui.credit-card',
        route: '/billing',
      },
    },
  ];

  // Usuarios solo para quien puede listarlos (el backend también lo exige)
  protected readonly sidebarItems = computed<SidebarGroup[]>(() =>
    this.authService.hasPermission('USER_READ')
      ? [
          ...this.baseSidebarItems,
          {
            item: {
              label: 'Usuarios',
              icon: '@tui.user-cog',
              route: '/users',
            },
          },
        ]
      : this.baseSidebarItems,
  );

  protected readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor(private readonly router: Router) {

    this.router.events
      .pipe(
        filter(
          (event) => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {

        const url = (event as NavigationEnd).urlAfterRedirects;

        const segments = url
          .split('/')
          .filter(Boolean);

        if (segments.length < 2) {
          this.breadcrumbs.set([]);
          return;
        }

        this.breadcrumbs.set(
          segments.map((segment, index) => ({
            label: this.formatBreadcrumb(segment),
            url: '/' + segments
              .slice(0, index + 1)
              .join('/'),
          }))
        );
      });
  }

  private formatBreadcrumb(value: string): string {
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}