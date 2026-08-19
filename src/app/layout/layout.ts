import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

import { TuiItem} from '@taiga-ui/cdk';

import {TuiBreadcrumbs, TuiFade } from '@taiga-ui/kit';

import { SidebarGroup } from './types';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-dashboard',
  imports: [
    Sidebar,
    Navbar,
    TuiBreadcrumbs,
    TuiFade,
    TuiItem,
    RouterOutlet,
  ],
  standalone: true,
  templateUrl: 'layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {

  protected readonly sidebarItems = signal<SidebarGroup[]>([
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
    }
  ]);

  protected readonly breadcrumbs = ['Inicio', 'Dashboard'];
}
