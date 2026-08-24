import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TuiDialogContext } from '@taiga-ui/core';

import { injectContext } from '@taiga-ui/polymorpheus';

import { BLOOD_TYPES, GENDERS } from '../../constans/patient-options';

import { PatientDetailResponse, PatientRequest } from '../../model';

import { PatientService } from '../../services/patient.service';

import { ModalForm } from '../../../../shared/components/modal-form/modal-form';
import { TuiDay } from '@taiga-ui/cdk';
import { NotificationService } from '../../../../core/services/alert-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { withNotification } from '../../../../shared/operators/with-notification';

@Component({
  selector: 'app-modal-create',

  imports: [ModalForm],

  templateUrl: './modal-create-edit.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCreateEdit {
  private readonly notificationService = inject(NotificationService);
  // ─────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────

  private readonly context =
    injectContext<TuiDialogContext<PatientRequest | null, PatientDetailResponse | null>>();

  protected readonly isEdit = !!this.context.data;

  private readonly patientService = inject(PatientService);

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────

  protected submitted = false;

  // ─────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────

  constructor() {
    const patient = this.context.data;

    if (patient) {
      this.form.patchValue({
        documentNumber: patient.documentNumber,
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: patient.birthDate
          ? TuiDay.fromLocalNativeDate(new Date(patient.birthDate))
          : null,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
      });
    }
  }

  // ─────────────────────────────────────────────
  // Form
  // ─────────────────────────────────────────────

  protected readonly form = new FormGroup({
    documentNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
    }),

    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)],
    }),

    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)],
    }),

    birthDate: new FormControl<TuiDay | null>(null, {
      validators: [Validators.required],
    }),

    gender: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{9}$/)],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    bloodType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    allergies: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly fields = [
    {
      name: 'documentNumber',
      label: 'DNI',
      placeholder: 'Ingrese DNI',
      type: 'text' as const,
      errorMessages: {
        required: 'DNI es requerido',
        pattern: 'El DNI debe tener 8 números',
      },
    },

    {
      name: 'firstName',
      label: 'Nombres',
      placeholder: 'Ingrese nombres',
      type: 'text' as const,
      errorMessages: {
        required: 'Nombres es requerido',
        pattern: 'Solo se permiten letras',
      },
    },

    {
      name: 'lastName',
      label: 'Apellidos',
      placeholder: 'Ingrese apellidos',
      type: 'text' as const,
      errorMessages: {
        required: 'Apellidos es requerido',
        pattern: 'Solo se permiten letras',
      },
    },

    {
      name: 'birthDate',
      label: 'Fecha de nacimiento',
      placeholder: 'Seleccione fecha',
      type: 'date' as const,
      errorMessages: {
        required: 'Fecha de nacimiento es requerida',
      },
    },

    {
      name: 'gender',
      label: 'Género',
      placeholder: 'Seleccione género',
      type: 'select' as const,
      options: GENDERS,
      errorMessages: {
        required: 'Género es requerido',
      },
    },

    {
      name: 'phone',
      label: 'Teléfono',
      placeholder: 'Ingrese teléfono',
      type: 'text' as const,
      errorMessages: {
        required: 'Teléfono es requerido',
        pattern: 'El teléfono debe tener 9 números',
      },
    },

    {
      name: 'email',
      label: 'Correo electrónico',
      placeholder: 'Ingrese correo electrónico',
      type: 'email' as const,
      errorMessages: {
        required: 'Correo electrónico es requerido',
        email: 'Ingrese un correo electrónico válido',
      },
    },

    {
      name: 'address',
      label: 'Dirección',
      placeholder: 'Ingrese dirección',
      type: 'text' as const,
      errorMessages: {
        required: 'Dirección es requerida',
      },
    },

    {
      name: 'bloodType',
      label: 'Tipo de sangre',
      placeholder: 'Seleccione tipo de sangre',
      type: 'select' as const,
      options: BLOOD_TYPES,
      errorMessages: {
        required: 'Tipo de sangre es requerido',
      },
    },

    {
      name: 'allergies',
      label: 'Alergias',
      placeholder: 'Ingrese alergias',
      type: 'text' as const,
      errorMessages: {
        required: 'Alergias es requerido',
      },
    },
  ];

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  protected save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const patient: PatientRequest = {
      ...value,

      birthDate: value.birthDate
        ? `${value.birthDate.year}-${String(value.birthDate.month + 1).padStart(2, '0')}-${String(
            value.birthDate.day,
          ).padStart(2, '0')}`
        : undefined,
    };

    if (this.isEdit) {
      this.patientService
        .update(this.context.data!.id, patient)
        .pipe(
          withNotification(this.notificationService, {
            success: 'Paciente actualizado correctamente',
          }),
        )
        .subscribe({
          next: (updatedPatient) => {
            this.context.completeWith(updatedPatient);
          },
        });

      return;
    }

    this.patientService
      .create(patient)
      .pipe(
        withNotification(this.notificationService, {
          success: 'Paciente creado correctamente',
        }),
      )
      .subscribe({
        next: (createdPatient) => {
          this.context.completeWith(createdPatient);
        },
      });
  }

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
