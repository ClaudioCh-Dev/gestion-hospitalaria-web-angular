import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { TuiDialogContext } from '@taiga-ui/core';

import { injectContext } from '@taiga-ui/polymorpheus';

import {
  CreateDoctorRequest,
  DoctorResponse,
  UpdateDoctorRequest,
} from '../../intefaces';

import { DoctorService } from '../../services/doctor.service';

import { SpecialtyStore } from '../../store/specialty.store';

import { ModalForm } from '../../../../shared/components/modal-form/modal-form';

import { NotificationService } from '../../../../core/services/alert-notification.service';

import { withNotification } from '../../../../shared/operators/with-notification';

@Component({
  selector: 'app-modal-create-edit',
  imports: [ModalForm],
  templateUrl: './modal-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCreateEdit {
  private readonly context =
    injectContext<
      TuiDialogContext<
        DoctorResponse | null,
        DoctorResponse | null
      >
    >();

  private readonly doctorService =
    inject(DoctorService);

  private readonly specialtyStore =
    inject(SpecialtyStore);

  private readonly notificationService =
    inject(NotificationService);

  // =====================================================
  // ESTADO
  // =====================================================

  protected submitted = false;

  protected loading = false;

  protected readonly isEdit =
    !!this.context.data;

  // =====================================================
  // ESPECIALIDADES
  // =====================================================

  protected readonly specialtyOptions =
    computed(() =>
      this.specialtyStore
        .specialties()
        .map((specialty) => ({
          id: specialty.id,
          value: specialty.name,
        })),
    );

  // =====================================================
  // FORMULARIO
  // =====================================================

  protected readonly form =
    new FormGroup({

      licenseNumber: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.required,
          Validators.maxLength(30),
        ],
      }),

      firstName: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.required,
          Validators.maxLength(100),

          Validators.pattern(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          ),
        ],
      }),

      lastName: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.required,
          Validators.maxLength(100),

          Validators.pattern(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          ),
        ],
      }),

      email: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.email,
          Validators.maxLength(150),
        ],
      }),

      phone: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.maxLength(20),
        ],
      }),

      specialtyId:
        new FormControl<number | null>(null, {
          validators: [
            Validators.required,
          ],
        }),

      scheduleStart: new FormControl('', {
        nonNullable: true,
      }),

      scheduleEnd: new FormControl('', {
        nonNullable: true,
      }),

      active: new FormControl(true, {
        nonNullable: true,
      }),
    });

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {
    const doctor = this.context.data;

    if (!doctor) {
      return;
    }

    this.form.patchValue({
      licenseNumber:
        doctor.licenseNumber,

      firstName:
        doctor.firstName,

      lastName:
        doctor.lastName,

      email:
        doctor.email ?? '',

      phone:
        doctor.phone ?? '',

      specialtyId:
        doctor.specialty?.id ?? null,

      scheduleStart:
        doctor.scheduleStart ?? '',

      scheduleEnd:
        doctor.scheduleEnd ?? '',

      active:
        doctor.active,
    });
  }

  // =====================================================
  // CAMPOS
  // =====================================================

  protected readonly fields = computed(() => [
    {
      name: 'licenseNumber',

      label: 'Número de licencia',

      placeholder:
        'Ingrese número de licencia',

      type: 'text' as const,

      errorMessages: {
        required:
          'La licencia es requerida',

        maxlength:
          'La licencia no puede superar 30 caracteres',
      },
    },

    {
      name: 'firstName',

      label: 'Nombres',

      placeholder:
        'Ingrese nombres',

      type: 'text' as const,

      errorMessages: {
        required:
          'Los nombres son requeridos',

        maxlength:
          'Máximo 100 caracteres',

        pattern:
          'Solo se permiten letras',
      },
    },

    {
      name: 'lastName',

      label: 'Apellidos',

      placeholder:
        'Ingrese apellidos',

      type: 'text' as const,

      errorMessages: {
        required:
          'Los apellidos son requeridos',

        maxlength:
          'Máximo 100 caracteres',

        pattern:
          'Solo se permiten letras',
      },
    },

    {
      name: 'email',

      label: 'Correo electrónico',

      placeholder:
        'Ingrese correo electrónico',

      type: 'email' as const,

      errorMessages: {
        email:
          'Ingrese un correo electrónico válido',

        maxlength:
          'Máximo 150 caracteres',
      },
    },

    {
      name: 'phone',

      label: 'Teléfono',

      placeholder:
        'Ingrese teléfono',

      type: 'text' as const,

      errorMessages: {
        maxlength:
          'Máximo 20 caracteres',
      },
    },

    {
      name: 'specialtyId',

      label: 'Especialidad',

      placeholder:
        'Seleccione especialidad',

      type: 'select' as const,

      options:
        this.specialtyOptions(),

      errorMessages: {
        required:
          'La especialidad es requerida',
      },
    },

    {
      name: 'scheduleStart',

      label: 'Hora de inicio',

      placeholder:
        'Ej. 08:00',

      type: 'text' as const,

      errorMessages: {},
    },

    {
      name: 'scheduleEnd',

      label: 'Hora de salida',

      placeholder:
        'Ej. 17:00',

      type: 'text' as const,

      errorMessages: {},
    },

    {
      name: 'active',

      label: 'Estado',

      placeholder: '',

      type: 'checkbox' as const,

      errorMessages: {},
    },
  ]);

  // =====================================================
  // GUARDAR
  // =====================================================

  protected save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value =
      this.form.getRawValue();

    // ===================================================
    // EDITAR
    // ===================================================

    if (this.isEdit) {
      const request:
        UpdateDoctorRequest = {

        firstName:
          value.firstName,

        lastName:
          value.lastName,

        email:
          value.email || undefined,

        phone:
          value.phone || undefined,

        specialtyId:
          value.specialtyId!,

        scheduleStart:
          value.scheduleStart || undefined,

        scheduleEnd:
          value.scheduleEnd || undefined,

        active:
          value.active,
      };

      this.doctorService
        .update(
          this.context.data!.id,
          request,
        )
        .pipe(
          withNotification(
            this.notificationService,
            {
              success:
                'Doctor actualizado correctamente',
            },
          ),
        )
        .subscribe({
          next: (doctor) => {
            this.context.completeWith(
              doctor,
            );
          },

          error: () => {
            this.loading = false;
          },
        });

      return;
    }

    // ===================================================
    // CREAR
    // ===================================================

    const request:
      CreateDoctorRequest = {

      licenseNumber:
        value.licenseNumber,

      firstName:
        value.firstName,

      lastName:
        value.lastName,

      email:
        value.email || undefined,

      phone:
        value.phone || undefined,

      specialtyId:
        value.specialtyId!,

      scheduleStart:
        value.scheduleStart || undefined,

      scheduleEnd:
        value.scheduleEnd || undefined,
    };

    this.doctorService
      .create(request)
      .pipe(
        withNotification(
          this.notificationService,
          {
            success:
              'Doctor creado correctamente',
          },
        ),
      )
      .subscribe({
        next: (doctor) => {
          this.context.completeWith(
            doctor,
          );
        },

        error: () => {
          this.loading = false;
        },
      });
  }

  // =====================================================
  // CANCELAR
  // =====================================================

  protected cancel(): void {
    this.context.completeWith(null);
  }
}