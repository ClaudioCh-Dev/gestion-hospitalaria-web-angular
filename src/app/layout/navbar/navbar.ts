import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { TuiActiveZone, TuiObscured } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiDialogService, TuiDropdown, TuiIcon, TuiOption, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { AuthService } from '@core/services/auth.service';

import { SidebarGroup } from '../types';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    TuiActiveZone,
    TuiAvatar,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiNavigation,
    TuiObscured,
    TuiOption,
    TuiTitle,
  ],
  templateUrl: 'navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);

  // Secciones del menú móvil (las mismas del sidebar, ya filtradas por permiso)
  readonly groupsOptions = input<SidebarGroup[]>([]);

  // Iniciales del correo del usuario autenticado para el avatar
  protected readonly initials = computed(
    () => (this.authService.currentUser()?.email.slice(0, 2) ?? '').toUpperCase(),
  );

  // =========================
  // DESPLEGABLES
  // =========================

  protected readonly menuOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly avatarOpen = signal(false);

  protected toggle(dropdown: WritableSignal<boolean>): void {
    dropdown.update((open) => !open);
  }

  // Se cierra al hacer clic fuera (tuiActiveZone) o si el ancla sale de la vista (tuiObscured)
  protected closeWhen(dropdown: WritableSignal<boolean>, close: boolean): void {
    if (close) {
      dropdown.set(false);
    }
  }

  // =========================
  // ACCIONES DEL AVATAR
  // =========================

  protected onProfile(): void {
    this.avatarOpen.set(false);

    // Carga diferida: el perfil no pesa en el bundle inicial
    import('../../features/profile/components/profile-dialog/profile-dialog').then(({ ProfileDialog }) =>
      this.dialogs
        .open(new PolymorpheusComponent(ProfileDialog), { label: 'Mi perfil', size: 'm' })
        .subscribe(),
    );
  }

  protected onLogout(): void {
    this.avatarOpen.set(false);

    // Aunque el backend falle, la sesión local se cierra igual
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearAccessToken();
        this.router.navigate(['/login']);
      },
    });
  }
}
