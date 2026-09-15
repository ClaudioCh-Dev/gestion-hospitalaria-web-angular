import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TuiBooleanHandler, TuiDay, TuiTime } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiCalendar,
  TuiDataList,
  TuiError,
  TuiFilterByInputOptions,
  TuiFilterByInputPipe,
  TuiTextfield,
  tuiItemsHandlersProvider,
  tuiValidationErrorsProvider,
} from '@taiga-ui/core';
import {
  TuiDataListWrapper,
  TuiInputDate,
  TuiInputNumber,
  TuiInputTime,
  TuiSelect,
  TuiTextarea,
  tuiCreateTimePeriods,
} from '@taiga-ui/kit';
import { TuiForm } from '@taiga-ui/layout';

@Component({
  selector: 'app-appointment-create-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,

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
    TuiForm
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
  // ==========================================
  // FECHA Y HORA
  // ==========================================

  protected readonly today = TuiDay.currentLocal();

  protected readonly maxDay = this.today.append({
    month: 2,
  });

  protected readonly minDate = new Date().toISOString().split('T')[0];

  protected readonly items: readonly TuiTime[] = tuiCreateTimePeriods(9, 19, [0, 30]);

  // ==========================================
  // FILTRO DE HORARIOS
  // ==========================================

  protected readonly filter: TuiFilterByInputOptions<TuiTime>['filter'] = (items, query) =>
    items.filter((time) => time.toString('HH:MM').startsWith(query));

  protected readonly disabledItemHandler: TuiBooleanHandler<TuiTime> = (time) => {
    const selectedDate = this.form.controls.scheduledDate.value;

    if (!selectedDate?.daySame(this.today)) {
      return false;
    }

    const currentTime = new Date();

    const currentTimeObj = new TuiTime(currentTime.getHours(), currentTime.getMinutes());

    return time.valueOf() < currentTimeObj.valueOf();
  };

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
  // TIPOS DE CITA
  // ==========================================

  protected readonly appointmentTypes = [
    { id: 1, name: 'Consulta médica' },
    { id: 2, name: 'Consulta de seguimiento' },
    { id: 3, name: 'Emergencia' },
    { id: 4, name: 'Evaluación médica' },
    { id: 5, name: 'Control preventivo' },
  ];

  // ==========================================
  // FORMULARIO
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

    scheduledDate: new FormControl<TuiDay | null>(null, Validators.required),

    scheduledTime: new FormControl<string | null>({
      value: null,
      disabled: true,
    }, Validators.required),

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

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

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
  }

  // ==========================================
  // CREAR CITA
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
