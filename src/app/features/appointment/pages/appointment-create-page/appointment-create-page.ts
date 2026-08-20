import { JsonPipe } from '@angular/common';

import { Component } from '@angular/core';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { TuiButton, TuiCalendar, TuiDataList, TuiTextfield } from '@taiga-ui/core';

import {
  TuiInputDate,
  TuiInputTime,
  TuiSelect,
  TuiStringifyContentPipe,
  TuiStringifyPipe,
  TuiTextarea,
} from '@taiga-ui/kit';

@Component({
  selector: 'app-appointment-create-page',

  imports: [
    ReactiveFormsModule,
    RouterLink,

    TuiButton,
    TuiTextfield,
    TuiDataList,
    TuiCalendar,

    TuiInputDate,
    TuiInputTime,
    TuiSelect,

    FormsModule,
    TuiTextarea,
  ],

  templateUrl: './appointment-create-page.html',
})
export class AppointmentCreatePage {
  protected value = '';

  // ==========================================
  // MOCK ESPECIALIDADES
  // ==========================================

  protected readonly specialties = [
    { id: 1, name: 'Medicina general' },
    { id: 2, name: 'Cardiología' },
    { id: 3, name: 'Pediatría' },
    { id: 4, name: 'Dermatología' },
  ];

  // ==========================================
  // MOCK PACIENTES
  // ==========================================

  protected readonly patients = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'María García' },
    { id: 3, name: 'Carlos López' },
  ];

  // ==========================================
  // MOCK MÉDICOS
  // ==========================================

  protected readonly doctors = [
    { id: 1, name: 'Dr. Carlos López' },
    { id: 2, name: 'Dra. María García' },
    { id: 3, name: 'Dr. Juan Pérez' },
  ];

  // ==========================================
  // FORM
  // ==========================================

  protected readonly form = new FormGroup({
    specialtyId: new FormControl<number | null>(null, Validators.required),

    patientId: new FormControl<number | null>(null, Validators.required),

    doctorId: new FormControl<number | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),

    appointmentTypeId: new FormControl<number | null>(null, Validators.required),

    scheduledDate: new FormControl<string | null>(null, Validators.required),

    scheduledTime: new FormControl<string | null>(null, Validators.required),

    durationMinutes: new FormControl<number>(30, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),

    reason: new FormControl<string>('', {
      nonNullable: true,
    }),

    notes: new FormControl<string>('', {
      nonNullable: true,
    }),
  });

  constructor() {
    // ==========================================
    // ESCUCHAR CAMBIO DE ESPECIALIDAD
    // ==========================================

    this.form.controls.specialtyId.valueChanges.subscribe((specialtyId) => {
      const doctorControl = this.form.controls.doctorId;

      doctorControl.reset();

      if (specialtyId) {
        doctorControl.enable();
      } else {
        doctorControl.disable();
      }
    });
  }

  // ==========================================
  // CREAR
  // ==========================================

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    const request = {
      specialtyId: value.specialtyId!,

      patientId: value.patientId!,

      doctorId: value.doctorId!,

      appointmentTypeId: value.appointmentTypeId!,

      scheduledAt: `${value.scheduledDate}T${value.scheduledTime}`,

      durationMinutes: value.durationMinutes,

      reason: value.reason,

      notes: value.notes,
    };

    console.log('Create appointment:', request);
  }
}
