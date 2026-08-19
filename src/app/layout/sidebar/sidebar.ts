import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButton } from '@taiga-ui/core';

import { SidebarGroup } from '../types';
import { TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-sidebar',

  imports: [
    RouterLink,
    TuiButton,
    TuiNavigation,
  ],

  templateUrl: './sidebar.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly groupsOptions = input<SidebarGroup[]>([]);

  protected readonly expanded = signal(true);

  protected handleToggle(): void {
    this.expanded.update((value) => !value);
  }
}