import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { TuiActiveZone, TuiObscured } from '@taiga-ui/cdk';
import {
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiInput,
    TuiOption,
    TuiTitle,
} from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgeNotification, TuiChevron, TuiFade, TuiTabs, TuiBadgedContentComponent, TuiBadgedContent } from '@taiga-ui/kit';
import { TuiNavigation} from '@taiga-ui/layout';
import { SidebarGroup } from '../types';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
 
	interface ExampleAction {
    readonly description: string;
    readonly title: string;
}

@Component({
    imports: [
    FormsModule,
    TuiAvatar,
    TuiBadgeNotification,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiInput,
    TuiNavigation,
    TuiTabs,
    TuiActiveZone,
    TuiDataList,
    TuiDropdown,
    TuiObscured,
    TuiTitle,
    TuiBadgedContent,
    RouterLink,
    TuiOption,
],
  selector: 'app-navbar',
  templateUrl: 'navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {

      private readonly authService = inject(AuthService);
      private readonly router = inject(Router);

    readonly groupsOptions = input<SidebarGroup[]>([]);

    protected readonly openSandwich = signal(false);

     protected readonly actions: readonly ExampleAction[] = [
        {
            title: 'Create task',
            description: 'Draft a follow-up item for the team',
        },
        {
            title: 'Schedule sync',
            description: 'Find a 30-minute window for everyone',
        },
        {
            title: 'Share update',
            description: 'Post the latest progress to the channel',
        },
    ];
 
    protected readonly open = signal(false);
    protected readonly selected = signal<ExampleAction | null>(null);
 
    protected onClick(): void {
        this.open.update((open) => !open);
    }
 
    protected onObscured(obscured: boolean): void {
        if (obscured) {
            this.open.set(false);
        }
    }
 
    protected onActiveZone(active: boolean): void {
        if (!active) {
            this.open.set(false);
        }
    }
 
    protected onSelect(action: ExampleAction): void {
        this.selected.set(action);
        this.open.set(false);
    }


    protected readonly avatarOpen = signal(false);

protected onAvatarClick(): void {
  this.avatarOpen.update((open) => !open);
}

protected onAvatarActiveZone(
  event: any
): void {
  if (!event) {
    this.avatarOpen.set(false);
  }
}

protected onAvatarObscured(
  event: boolean
): void {
  if (event) {
    this.avatarOpen.set(false);
  }
}

protected onProfile(): void {
  this.avatarOpen.set(false);

  // this.router.navigate(['/profile']);
}

protected onLogout(): void {
  this.avatarOpen.set(false);

  this.authService.logout().subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: (error) => {
      console.error('Error logging out:', error);
    }
  });
}
}
