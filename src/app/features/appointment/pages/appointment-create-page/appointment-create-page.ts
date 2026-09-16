import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TuiDay, TuiPlatform, TuiTime } from '@taiga-ui/cdk';

import {
  TuiButton,
  TuiCalendar,
  TuiDataList,
  TuiError,
  TuiFilterByInputPipe,
  TuiLabel,
  TuiRadio,
  TuiTextfield,
  tuiItemsHandlersProvider,
  tuiValidationErrorsProvider,
} from '@taiga-ui/core';

import {
  TuiChip,
  TuiDataListWrapper,
  TuiInputDate,
  TuiInputNumber,
  TuiInputTime,
  TuiSelect,
  TuiTextarea,
  tuiCreateTimePeriods,
} from '@taiga-ui/kit';

import { TuiForm, TuiItemGroup } from '@taiga-ui/layout';

@Component({
  selector: 'app-appointment-create-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,

    // Taiga UI
    TuiButton,
    TuiTextfield,
    TuiDataList,
    TuiDataListWrapper,
    TuiCalendar,
    TuiInputNumber,
    TuiInputDate,
    TuiInputTime,
    TuiSelect,
    TuiTextarea,
    TuiFilterByInputPipe,
    TuiError,
    TuiForm,
    TuiLabel,
    TuiRadio,
    TuiChip,
    TuiItemGroup,
    TuiPlatform,
  ],
  providers: [
    tuiItemsHandlersProvider({
      stringify: signal((time: TuiTime) => time.toString('HH:MM')),
      identityMatcher: signal(
        (a: TuiTime | null, b: TuiTime | null) => a?.valueOf() === b?.valueOf(),
      ),
    }),

    tuiValidationErrorsProvider({
      tuiUnfinished: 'Either fill this or leave blank',
      required: 'Es requerido',
    }),
  ],
  templateUrl: './appointment-create-page.html',
})
export class AppointmentCreatePage {
  // ============================================================
  // MOCKS
  // ============================================================

  protected readonly specialties = [
    { id: 1, name: 'Medicina general' },
    { id: 2, name: 'Cardiología' },
    { id: 3, name: 'Pediatría' },
    { id: 4, name: 'Dermatología' },
  ];

  protected readonly patients = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'María García' },
    { id: 3, name: 'Carlos López' },
  ];

  protected readonly doctors = [
    { id: 1, name: 'Dr. Carlos López' },
    { id: 2, name: 'Dra. María García' },
    { id: 3, name: 'Dr. Juan Pérez' },
  ];

  protected readonly appointmentTypes = [
    { id: 1, name: 'Consulta médica' },
    { id: 2, name: 'Consulta de seguimiento' },
    { id: 3, name: 'Emergencia' },
    { id: 4, name: 'Evaluación médica' },
    { id: 5, name: 'Control preventivo' },
  ];

  protected readonly appointments = [
    {
      id: 1,
      patientId: 101,
      doctorId: 1,
      scheduledAt: '2026-09-16T09:00:00',
      durationMinutes: 30,
      reason: 'Consulta general',
      status: 'SCHEDULED',
      notes: 'Paciente refiere dolor de cabeza frecuente',
      createdAt: '2026-09-10T14:30:00',
    },
    {
      id: 2,
      patientId: 102,
      doctorId: 2,
      scheduledAt: '2026-09-16T10:00:00',
      durationMinutes: 45,
      reason: 'Control cardiológico',
      status: 'CONFIRMED',
      notes: 'Control de presión arterial',
      createdAt: '2026-09-11T09:15:00',
    },
    {
      id: 3,
      patientId: 103,
      doctorId: 3,
      scheduledAt: '2026-09-16T11:30:00',
      durationMinutes: 30,
      reason: 'Consulta pediátrica',
      status: 'SCHEDULED',
      notes: 'Control de rutina',
      createdAt: '2026-09-12T16:20:00',
    },
    {
      id: 4,
      patientId: 104,
      doctorId: 1,
      scheduledAt: '2026-09-16T14:00:00',
      durationMinutes: 30,
      reason: 'Dolor abdominal',
      status: 'COMPLETED',
      notes: 'Seguimiento de tratamiento',
      createdAt: '2026-09-08T11:45:00',
    },
    {
      id: 5,
      patientId: 105,
      doctorId: 4,
      scheduledAt: '2026-09-17T09:30:00',
      durationMinutes: 60,
      reason: 'Evaluación dermatológica',
      status: 'CANCELLED',
      notes: 'Reprogramar para próxima semana',
      createdAt: '2026-09-13T10:00:00',
    },
  ];

  // ============================================================
  // FECHA Y HORA
  // ============================================================

  protected readonly today = TuiDay.currentLocal();

  protected readonly maxDay = this.today.append({
    month: 2,
  });

  protected readonly minDate = new Date().toISOString().split('T')[0];

  protected readonly items: readonly TuiTime[] = tuiCreateTimePeriods(9, 19, [0, 30]);

  protected readonly chips: readonly TuiTime[] = tuiCreateTimePeriods(9, 21, [0, 30]);

  protected selected = 'Wi-Fi';

  // ============================================================
  // FORMULARIO
  // ============================================================

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

    scheduledDate: new FormControl<TuiDay | null>(null, Validators.required),

    scheduledTime: new FormControl<string | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),

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

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor() {
    this.form.controls.specialtyId.valueChanges.subscribe((specialtyId) => {
      const doctorControl = this.form.controls.doctorId;

      doctorControl.reset();

      if (specialtyId) {
        doctorControl.enable();
      } else {
        doctorControl.disable();
      }
    });

    this.form.controls.scheduledDate.valueChanges.subscribe((scheduledDate) => {
      const timeControl = this.form.controls.scheduledTime;

      timeControl.enable();
      timeControl.reset();
    });

    this.form.controls.durationMinutes.valueChanges.subscribe(() => {
      const timeControl = this.form.controls.scheduledTime;

      timeControl.reset();
    });
  }

  // ============================================================
  // HORARIOS
  // ============================================================

  protected readonly disabledTime = (time: TuiTime): boolean => {
    const selectedDate = this.form.controls.scheduledDate.value;
    const selectedDoctor = this.form.controls.doctorId.value;
    const duration = this.form.controls.durationMinutes.value;

    if (!selectedDate || !selectedDoctor || !duration) {
      return true;
    }

    // Si es hoy, bloquear horas pasadas
    if (selectedDate.daySame(this.today)) {
      const currentTime = new Date();

      const currentTimeObj = new TuiTime(currentTime.getHours(), currentTime.getMinutes());

      if (time.valueOf() < currentTimeObj.valueOf()) {
        return true;
      }
    }

    // Citas del doctor en la fecha seleccionada
    const doctorAppointments = this.appointments.filter(
      (appointment) =>
        //appointment.doctorId === selectedDoctor && //TODO: HABILITARLO DESPUES CON LA API
        this.isSameDate(appointment.scheduledAt, selectedDate),
    );

    // Inicio de la cita que el usuario quiere crear
    const selectedStart = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      time.hours,
      time.minutes,
    );

    // Fin según la duración seleccionada
    const selectedEnd = new Date(selectedStart.getTime() + duration * 60_000);

    // Verificar si se cruza con alguna cita existente
    return doctorAppointments.some((appointment) => {
      const appointmentStart = new Date(appointment.scheduledAt);

      const appointmentEnd = new Date(
        appointmentStart.getTime() + appointment.durationMinutes * 60_000,
      );

      return selectedStart < appointmentEnd && selectedEnd > appointmentStart;
    });
  };

  protected getTimeAppearance(chip: TuiTime): string {
    if (chip.toString('HH:MM') === this.form.controls.scheduledTime.value) {
      return 'accent';
    }

    if (this.disabledTime(chip)) {
      return 'action-grayscale';
    }

    return 'outline';
  }

  protected onTimeClicked(time: string): void {
    this.form.controls.scheduledTime.setValue(time);
  }

  // ============================================================
  // CREAR CITA
  // ============================================================

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

  // ============================================================
  // HELPERS
  // ============================================================

  private isSameDate(scheduledAt: string, selectedDate: TuiDay): boolean {
    const appointmentDate = new Date(scheduledAt);

    return (
      appointmentDate.getFullYear() === selectedDate.year &&
      appointmentDate.getMonth() === selectedDate.month &&
      appointmentDate.getDate() === selectedDate.day
    );
  }
}
