import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

import { AuthService } from '@core/services/auth.service';
import { DoctorService } from '@doctors/services/doctor.service';
import { AvatarDefaultDoctorPipe } from '@shared/pipes/avatar-default-doctor-pipe';

import { ROLE_DOCTOR, getRoleLabel } from '../../../user/constants/user-roles';
import { ChangePasswordForm } from '../change-password-form/change-password-form';

@Component({
  selector: 'app-profile-dialog',
  imports: [AvatarDefaultDoctorPipe, ChangePasswordForm, TuiBadge, TuiButton, TuiIcon],
  templateUrl: './profile-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDialog {
  private readonly context = injectContext<TuiDialogContext<void>>();

  private readonly authService = inject(AuthService);

  private readonly doctorService = inject(DoctorService);

  private readonly router = inject(Router);

  protected readonly user = this.authService.currentUser;

  protected readonly isDoctor = computed(() => this.user()?.role === ROLE_DOCTOR);

  protected readonly roleLabel = computed(() => getRoleLabel(this.user()?.role ?? ''));

  protected readonly showPasswordForm = signal(false);

  // Solo los médicos tienen ficha en doctor-ms
  protected readonly doctorResource = rxResource({
    params: () => ({ isDoctor: this.isDoctor() }),
    stream: ({ params }) => (params.isDoctor ? this.doctorService.findMe() : of(null)),
  });

  protected readonly displayName = computed(() => {
    const doctor = this.doctorResource.value();

    return doctor ? `${doctor.firstName} ${doctor.lastName}` : this.user()?.email ?? '';
  });

  protected readonly initials = computed(() => {
    const doctor = this.doctorResource.value();

    return doctor
      ? `${doctor.firstName[0] ?? ''}${doctor.lastName[0] ?? ''}`.toUpperCase()
      : (this.user()?.email.slice(0, 2) ?? '').toUpperCase();
  });

  // Permisos agrupados por módulo: PATIENT_READ → Patient: read
  protected readonly permissionGroups = computed(() => {
    const groups = new Map<string, string[]>();

    for (const permission of this.user()?.permissions ?? []) {
      const [module, ...action] = permission.split('_');

      groups.set(module, [...(groups.get(module) ?? []), action.join(' ').toLowerCase()]);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, actions]) => ({ module: module.toLowerCase(), actions }));
  });

  protected formatTime(time?: string): string {
    return time ? time.slice(0, 5) : '--:--';
  }

  // El backend revoca las sesiones: se limpia el token local y se vuelve al login
  protected onPasswordChanged(): void {
    this.context.completeWith();

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearAccessToken();
        this.router.navigate(['/login']);
      },
    });
  }

  protected close(): void {
    this.context.completeWith();
  }
}
