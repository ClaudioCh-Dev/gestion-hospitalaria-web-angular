import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { TuiActiveZone, TuiObscured } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiCell,
  TuiDataList,
  TuiDialogService,
  TuiDropdown,
  TuiIcon,
  TuiOption,
  TuiScrollbar,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiAvatar, TuiBadgeNotification } from '@taiga-ui/kit';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { AuthService } from '@core/services/auth.service';

import {
  NOTIFICATION_TYPE_APPEARANCES,
  NOTIFICATION_TYPE_ICONS,
} from '../../features/notification/constants/notification-type';
import { NotificationResponse } from '../../features/notification/interfaces';
import { NotificationStore } from '../../features/notification/store/notification.store';

import { SidebarGroup } from '../types';

@Component({
  selector: 'app-navbar',
  imports: [
    DatePipe,
    RouterLink,
    TuiActiveZone,
    TuiAvatar,
    TuiBadgeNotification,
    TuiButton,
    TuiCell,
    TuiDataList,
    TuiDropdown,
    TuiHeader,
    TuiIcon,
    TuiNavigation,
    TuiObscured,
    TuiOption,
    TuiScrollbar,
    TuiTitle,
  ],
  templateUrl: 'navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);

  // Campana: lista, no leídas y stream SSE (se conecta solo al iniciar sesión)
  protected readonly notifications = inject(NotificationStore);

  protected readonly typeIcons = NOTIFICATION_TYPE_ICONS;
  protected readonly typeAppearances = NOTIFICATION_TYPE_APPEARANCES;

  // "9+" para que el badge no crezca
  protected readonly unreadLabel = computed(() => {
    const count = this.notifications.unreadCount();

    return count > 9 ? '9+' : String(count);
  });

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
  // NOTIFICACIONES
  // =========================

  protected onNotification(notification: NotificationResponse): void {
    this.notificationsOpen.set(false);
    this.notifications.markAsRead(notification.id);

    // Todas son de citas: la agenda (el admin ve todas, el médico solo las suyas)
    this.router.navigate(['/appointments']);
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
