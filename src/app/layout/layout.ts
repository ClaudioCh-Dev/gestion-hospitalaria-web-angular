import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs';

import { TuiItem } from '@taiga-ui/cdk';
import { TuiBreadcrumbs, TuiFade } from '@taiga-ui/kit';

import { SidebarGroup } from './types';
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

  private readonly allSidebarItems: SidebarGroup[] = [
    {
      item: {
        label: 'Dashboard',
        icon: '@tui.layout-dashboard',
        route: '/dashboard',
        permission: 'DASHBOARD_READ',
      },
    },
    {
      item: {
        label: 'Pacientes',
        icon: '@tui.users',
        route: '/patients',
        permission: 'PATIENT_READ',
      },
    },
    {
      item: {
        label: 'Médicos',
        icon: '@tui.stethoscope',
        route: '/doctors',
        permission: 'DOCTOR_READ',
      },
    },
    {
      item: {
        label: 'Citas',
        icon: '@tui.calendar',
        route: '/appointments',
        // Agenda completa (admin) o solo la propia (médico)
        permission: ['APPOINTMENT_READ', 'APPOINTMENT_READ_BY_DOCTOR'],
      },
    },
    {
      item: {
        label: 'Tipos de cita',
        icon: '@tui.tag',
        route: '/appointment-types',
        permission: 'APPOINTMENT_TYPE_MANAGE',
      },
    },
    {
      item: {
        label: 'Historias clínicas',
        icon: '@tui.file-text',
        route: '/medical-records',
        permission: 'MEDICAL_RECORD_READ',
      },
    },
    {
      item: {
        label: 'Facturación',
        icon: '@tui.credit-card',
        route: '/billing',
        permission: 'BILLING_READ',
      },
    },
    {
      item: {
        label: 'Usuarios',
        icon: '@tui.user-cog',
        route: '/users',
        permission: 'USER_READ',
      },
    },
  ];

  // Solo las opciones cuyo permiso tiene el usuario (los guards de ruta también lo exigen)
  protected readonly sidebarItems = computed(() =>
    this.allSidebarItems.filter((group) => this.canSee(group.item.permission)),
  );

  private canSee(permission: string | string[] | undefined): boolean {
    const permissions = typeof permission === 'string' ? [permission] : permission ?? [];

    return !permissions.length || permissions.some((item) => this.authService.hasPermission(item));
  }

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
