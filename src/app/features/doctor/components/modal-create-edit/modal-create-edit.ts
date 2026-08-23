import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { CreateDoctorRequest, DoctorResponse, UpdateDoctorRequest } from '../../model/doctor.dtos';

import { DoctorService } from '../../services/doctor.service';

import { ModalForm } from '../../../../shared/components/modal-form/modal-form';

@Component({
  selector: 'app-modal-create-edit',

  imports: [ModalForm],

  templateUrl: './modal-create-edit.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCreateEdit {
  // =====================================================
  // Dependencies
  // =====================================================

  private readonly context =
    injectContext<TuiDialogContext<DoctorResponse | null, DoctorResponse | null>>();

  private readonly doctorService = inject(DoctorService);

  // =====================================================
  // State
  // =====================================================

  protected submitted = false;

  protected readonly isEdit = !!this.context.data;
  // =====================================================
  // Form
  // =====================================================

  protected readonly form = new FormGroup({
    licenseNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(30)],
    }),

    firstName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
      ],
    }),

    lastName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
      ],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(150)],
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),

    specialtyId: new FormControl<number | null>(null, {
      validators: [Validators.required],
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
  // Constructor
  // =====================================================

  constructor() {
    const doctor = this.context.data;

    if (!doctor) {
      return;
    }

    this.form.patchValue({
      licenseNumber: doctor.licenseNumber,

      firstName: doctor.firstName,

      lastName: doctor.lastName,

      email: doctor.email ?? '',

      phone: doctor.phone ?? '',

      specialtyId: doctor.specialty?.id ?? null,

      scheduleStart: doctor.scheduleStart ?? '',

      scheduleEnd: doctor.scheduleEnd ?? '',

      active: doctor.active,
    });
  }

  // =====================================================
  // Fields
  // =====================================================

  protected readonly fields = [
    {
      name: 'licenseNumber',
      label: 'Número de licencia',
      placeholder: 'Ingrese número de licencia',
      type: 'text' as const,

      errorMessages: {
        required: 'La licencia es requerida',
        maxlength: 'La licencia no puede superar 30 caracteres',
      },
    },

    {
      name: 'firstName',
      label: 'Nombres',
      placeholder: 'Ingrese nombres',
      type: 'text' as const,

      errorMessages: {
        required: 'Los nombres son requeridos',
        maxlength: 'Máximo 100 caracteres',
        pattern: 'Solo se permiten letras',
      },
    },

    {
      name: 'lastName',
      label: 'Apellidos',
      placeholder: 'Ingrese apellidos',
      type: 'text' as const,

      errorMessages: {
        required: 'Los apellidos son requeridos',
        maxlength: 'Máximo 100 caracteres',
        pattern: 'Solo se permiten letras',
      },
    },

    {
      name: 'email',
      label: 'Correo electrónico',
      placeholder: 'Ingrese correo electrónico',
      type: 'email' as const,

      errorMessages: {
        email: 'Ingrese un correo electrónico válido',
        maxlength: 'Máximo 150 caracteres',
      },
    },

    {
      name: 'phone',
      label: 'Teléfono',
      placeholder: 'Ingrese teléfono',
      type: 'text' as const,

      errorMessages: {
        maxlength: 'Máximo 20 caracteres',
      },
    },

    {
      name: 'specialtyId',
      label: 'Especialidad',
      placeholder: 'Seleccione especialidad',
      type: 'select' as const,

      // Después podemos reemplazar esto
      // por las especialidades del backend.

      options: [
        {key: 'Cardiologia', value: 1},
        {key: 'Pediatría', value: 2},
        {key: 'Dermatología', value: 3},
        {key: 'Neurología', value: 4},
        {key: 'Traumatología', value: 5},
        {key: 'Medicina Interna', value: 6},
        {key: 'Cirugía General', value: 7},
        {key: 'Ginecología', value: 8},
        {key: 'Oncología', value: 9},
        {key: 'Oftalmología', value: 10},
        {key: 'Otorrinolaringología', value: 11},
        {key: 'Psiquiatría', value: 12},
        {key: 'Radiología', value: 13},
        {key: 'Urología', value: 14},
        {key: 'Anestesiología', value: 15},
        {key: 'Cirugía Plástica', value: 16},
        {key: 'Dental', value: 17},
        {key: 'Nutrición', value: 18},
        {key: 'Fisioterapia', value: 19},
        {key: 'Terapia Ocupacional', value: 20},
        {key: 'Psicología', value: 21},
        {key: 'Podología', value: 22},
        {key: 'Farmacia', value: 23},
        {key: 'Laboratorio', value: 24},
        {key: 'Imagenología', value: 25},
        {key: 'Servicio Social', value: 26},
        {key: 'Otro', value: 27},
      ],

      errorMessages: {
        required: 'La especialidad es requerida',
      },
    },

    {
      name: 'scheduleStart',
      label: 'Hora de inicio',
      placeholder: 'Ej. 08:00',
      type: 'text' as const,

      errorMessages: {},
    },

    {
      name: 'scheduleEnd',
      label: 'Hora de salida',
      placeholder: 'Ej. 17:00',
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
  ];

  // =====================================================
  // Save
  // =====================================================

  protected save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    // =================================================
    // UPDATE
    // =================================================

    if (this.isEdit) {
      const request: UpdateDoctorRequest = {
        firstName: value.firstName,

        lastName: value.lastName,

        email: value.email || undefined,

        phone: value.phone || undefined,

        specialtyId: value.specialtyId!,

        scheduleStart: value.scheduleStart || undefined,

        scheduleEnd: value.scheduleEnd || undefined,

        active: value.active,
      };

      this.doctorService.update(this.context.data!.id, request).subscribe({
        next: (doctor) => {
          this.context.completeWith(doctor);
        },

        error: (error) => {
          console.error('Error al actualizar doctor:', error);
        },
      });

      return;
    }

    // =================================================
    // CREATE
    // =================================================

    const request: CreateDoctorRequest = {
      licenseNumber: value.licenseNumber,

      firstName: value.firstName,

      lastName: value.lastName,

      email: value.email || undefined,

      phone: value.phone || undefined,

      specialtyId: value.specialtyId!,

      scheduleStart: value.scheduleStart || undefined,

      scheduleEnd: value.scheduleEnd || undefined,
    };

    this.doctorService.create(request).subscribe({
      next: (doctor) => {
        this.context.completeWith(doctor);
      },

      error: (error) => {
        console.error('Error al crear doctor:', error);
      },
    });
  }

  // =====================================================
  // Cancel
  // =====================================================

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
