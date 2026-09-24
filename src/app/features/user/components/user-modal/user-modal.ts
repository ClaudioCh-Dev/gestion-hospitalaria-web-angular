import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { NotificationService } from '@core/services/alert-notification.service';
import { FormField, ModalForm } from '@shared/components/modal-form/modal-form';
import { withNotification } from '@shared/operators/with-notification';

import { ROLE_DOCTOR, getRoleLabel } from '../../constants/user-roles';
import { RoleResponse, UserResponse } from '../../interfaces';
import { UserService } from '../../services/user.service';

export interface UserModalData {
  user: UserResponse | null;
  roles: RoleResponse[];
}

@Component({
  selector: 'app-user-modal',
  imports: [ModalForm, TuiIcon],
  template: `
    <div class="flex flex-col gap-6">
      @if (data.user; as user) {
        <!-- Editar: a quién se está editando -->
        <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--tui-background-accent-1) text-sm font-semibold text-white"
          >
            {{ user.email.slice(0, 2).toUpperCase() }}
          </span>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900">{{ user.email }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ roleLabel(user.role) }} · {{ statusLabel(user) }}</p>
          </div>
        </div>
      } @else {
        <!-- Crear: qué pasa después -->
        <div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <tui-icon icon="@tui.mail" class="mt-0.5 shrink-0 text-(--tui-background-accent-1)" />
          <p class="text-sm leading-relaxed text-slate-600">
            Se enviará un correo a la dirección indicada para que el usuario active su cuenta y cree su
            contraseña. Las cuentas de médicos se crean desde <strong>Médicos</strong>.
          </p>
        </div>
      }

      <app-modal-form
        [form]="form"
        [fields]="fields"
        [submitted]="submitted()"
        [columns]="1"
        (submit)="save()"
        (cancel)="cancel()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserModal {
  private readonly context = injectContext<TuiDialogContext<boolean, UserModalData>>();

  private readonly userService = inject(UserService);

  private readonly notificationService = inject(NotificationService);

  protected readonly data = this.context.data;

  protected readonly isEdit = !!this.data.user;

  protected readonly roleLabel = getRoleLabel;

  protected statusLabel(user: UserResponse): string {
    if (user.active) {
      return 'Activo';
    }

    return user.activationPending ? 'Pendiente de activación' : 'Inactivo';
  }

  protected readonly submitted = signal(false);

  // Un usuario DOCTOR sin ficha en doctor-ms queda huérfano: ese rol no se asigna desde aquí
  private readonly roleOptions = this.data.roles
    .filter((role) => role.name !== ROLE_DOCTOR)
    .map((role) => ({ id: role.id, value: getRoleLabel(role.name) }));

  protected readonly form = new FormGroup({
    email: new FormControl(this.data.user?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    roleId: new FormControl<number | null>(
      this.data.user?.roleId ?? this.roleOptions[0]?.id ?? null,
      Validators.required,
    ),
  });

  protected readonly fields: FormField[] = [
    {
      name: 'email',
      label: 'Correo electrónico',
      placeholder: 'usuario@hospital.com',
      type: 'email',
      errorMessages: {
        required: 'El correo es requerido',
        email: 'Ingrese un correo válido',
      },
    },
    {
      name: 'roleId',
      label: 'Rol',
      placeholder: 'Seleccione un rol',
      type: 'select',
      options: this.roleOptions,
      errorMessages: { required: 'El rol es requerido' },
    },
  ];

  protected save(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, roleId } = this.form.getRawValue();

    const request$ = this.data.user
      ? this.userService.update(this.data.user.id, { email, roleId: roleId!, password: null })
      : this.userService.create({ email, roleId: roleId! });

    request$
      .pipe(
        withNotification(this.notificationService, {
          success: this.isEdit
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado. Se envió el correo de activación',
        }),
      )
      .subscribe({
        next: () => this.context.completeWith(true),
      });
  }

  protected cancel(): void {
    this.context.completeWith(false);
  }
}
