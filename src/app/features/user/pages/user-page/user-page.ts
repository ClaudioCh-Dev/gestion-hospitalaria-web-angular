import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { filter, forkJoin, switchMap } from 'rxjs';

import { TuiTable } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiDialogService,
  TuiHint,
  TuiIcon,
  TuiInput,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiButtonLoading, type TuiConfirmData } from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/alert-notification.service';
import { StateMessage } from '@shared/components/state-message/state-message';
import { withNotification } from '@shared/operators/with-notification';

import { UserModal, UserModalData } from '../../components/user-modal/user-modal';
import { ROLE_ADMIN, ROLE_DOCTOR, getRoleLabel } from '../../constants/user-roles';
import { UserResponse } from '../../interfaces';
import { UserService } from '../../services/user.service';

export type UserStatus = 'active' | 'pending' | 'inactive';

type StatusFilter = 'all' | UserStatus;

const STATUS_CONFIG: Record<UserStatus, { label: string; appearance: string; icon: string }> = {
  active: { label: 'Activo', appearance: 'positive', icon: '@tui.circle-check' },
  pending: { label: 'Pendiente de activación', appearance: 'warning', icon: '@tui.mail' },
  inactive: { label: 'Inactivo', appearance: 'neutral', icon: '@tui.circle-minus' },
};

@Component({
  selector: 'app-user-page',
  imports: [
    FormsModule,
    StateMessage,
    TuiBadge,
    TuiButton,
    TuiButtonLoading,
    TuiHint,
    TuiIcon,
    TuiInput,
    TuiTable,
    TuiTextfield,
    TuiTitle,
  ],
  templateUrl: './user-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPage {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notificationService = inject(NotificationService);

  protected readonly statusConfig = STATUS_CONFIG;

  protected readonly roleLabel = getRoleLabel;

  protected readonly search = signal('');

  protected readonly statusFilter = signal<StatusFilter>('all');

  // Usuario sobre el que hay una acción en curso (reenvío o desactivación)
  protected readonly busyId = signal<number | null>(null);

  protected readonly currentUserId = computed(() => this.authService.currentUser()?.userId);

  protected readonly resource = rxResource({
    stream: () =>
      forkJoin({
        users: this.userService.findAll(),
        roles: this.userService.findRoles(),
      }),
  });

  private readonly users = computed(() => this.resource.value()?.users ?? []);

  protected readonly counts = computed(() => {
    const users = this.users();

    return {
      all: users.length,
      active: users.filter((user) => this.getStatus(user) === 'active').length,
      pending: users.filter((user) => this.getStatus(user) === 'pending').length,
      inactive: users.filter((user) => this.getStatus(user) === 'inactive').length,
    };
  });

  protected readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  protected readonly rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.users()
      .filter((user) => status === 'all' || this.getStatus(user) === status)
      .filter(
        (user) =>
          !term ||
          user.email.toLowerCase().includes(term) ||
          this.roleLabel(user.role).toLowerCase().includes(term),
      )
      .sort((a, b) => a.email.localeCompare(b.email));
  });

  protected getStatus(user: UserResponse): UserStatus {
    if (user.active) {
      return 'active';
    }

    return user.activationPending ? 'pending' : 'inactive';
  }

  protected initials(email: string): string {
    return email.slice(0, 2).toUpperCase();
  }

  protected isSelf(user: UserResponse): boolean {
    return user.id === this.currentUserId();
  }

  // Los médicos se editan desde el módulo de Médicos (su correo vive también en doctor-ms)
  protected canEdit(user: UserResponse): boolean {
    return user.role !== ROLE_DOCTOR;
  }

  // Igual que el backend: ni administradores ni el propio usuario
  protected canDeactivate(user: UserResponse): boolean {
    return user.active && user.role !== ROLE_ADMIN && !this.isSelf(user);
  }

  protected create(): void {
    this.openModal('Nuevo usuario', null);
  }

  protected edit(user: UserResponse): void {
    this.openModal('Editar usuario', user);
  }

  protected resendActivation(user: UserResponse): void {
    const pending = this.getStatus(user) === 'pending';

    const data: TuiConfirmData = {
      content: pending
        ? `Se enviará un nuevo enlace de activación a <strong>${user.email}</strong>. El enlace anterior dejará de funcionar.`
        : `La cuenta <strong>${user.email}</strong> está desactivada. Se le enviará un enlace para que la vuelva a activar y cree una nueva contraseña.`,
      yes: 'Enviar',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: pending ? '¿Reenviar activación?' : '¿Enviar activación?',
        size: 's',
        data,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.busyId.set(user.id);

          return this.userService.resendActivation(user.email).pipe(
            withNotification(this.notificationService, {
              success: `Correo de activación enviado a ${user.email}`,
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.resource.reload();
        },
        error: () => this.busyId.set(null),
      });
  }

  protected deactivate(user: UserResponse): void {
    const data: TuiConfirmData = {
      content: `<strong>${user.email}</strong> no podrá iniciar sesión y se cerrarán sus sesiones abiertas.`,
      yes: 'Desactivar',
      no: 'Cancelar',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: '¿Desactivar usuario?',
        size: 's',
        data,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.busyId.set(user.id);

          return this.userService.deactivate(user.id).pipe(
            withNotification(this.notificationService, {
              success: 'Usuario desactivado correctamente',
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.resource.reload();
        },
        error: () => this.busyId.set(null),
      });
  }

  private openModal(label: string, user: UserResponse | null): void {
    const data: UserModalData = {
      user,
      roles: this.resource.value()?.roles ?? [],
    };

    this.dialogs
      .open<boolean>(new PolymorpheusComponent(UserModal), {
        label,
        size: 's',
        data,
      })
      .pipe(filter(Boolean))
      .subscribe(() => this.resource.reload());
  }
}
