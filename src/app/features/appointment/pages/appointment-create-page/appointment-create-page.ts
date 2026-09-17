import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, map, of } from 'rxjs';

import { TuiDay, TuiPlatform, TuiTime } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiCalendar,
  TuiDataList,
  TuiError,
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

import { DoctorService } from '@doctors/services/doctor.service';
import { PatientService } from '@patients/services/patient.service';
import { AppointmentTypeService } from '@appointment/services/appointment-type.service';
import { FormOption } from '@shared/components/modal-form/modal-form';

interface AppointmentData {
  specialties: FormOption[];
  patients: FormOption[];
  appointmentTypes: FormOption[];
}

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
        (a: TuiTime | null, b: TuiTime | null) =>
          a?.valueOf() === b?.valueOf(),
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
  // DEPENDENCIAS
  // ============================================================

  private readonly doctorService = inject(DoctorService);
  private readonly patientService = inject(PatientService);
  private readonly appointmentTypeService = inject(AppointmentTypeService);

  // ============================================================
  // SIGNALS
  // ============================================================

  protected readonly specialtyId = signal<number | null>(null);

  // ============================================================
  // RECURSOS
  // ============================================================

  /**
   * Datos iniciales del formulario:
   * - Especialidades
   * - Pacientes
   * - Tipos de cita
   */
  protected readonly appointmentData = rxResource({
    stream: () =>
      forkJoin({
        specialties: this.doctorService.findAllSpecialties().pipe(
          map(specialties =>
            specialties.map(specialty => ({
              id: specialty.id,
              value: specialty.name,
            })),
          ),
        ),

        patients: this.patientService.findAll(0, 100).pipe(
          map(response =>
            response.content.map(patient => ({
              id: patient.id,
              value: `${patient.firstName} ${patient.lastName}`,
            })),
          ),
        ),

        appointmentTypes: this.appointmentTypeService.findAll().pipe(
          map(types =>
            types.map(type => ({
              id: type.id,
              value: type.title,
            })),
          ),
        ),
      }),
  });

  /**
   * Médicos según la especialidad seleccionada.
   */
  protected readonly doctorData = rxResource({
    params: () => ({
      specialtyId: this.specialtyId(),
    }),

    stream: ({ params }) => {
      if (!params.specialtyId) {
        return of([]);
      }

      return this.doctorService
        .findBySpecialty(params.specialtyId, 0, 100)
        .pipe(
          map(response =>
            response.content.map(doctor => ({
              id: doctor.id,
              value: `${doctor.firstName} ${doctor.lastName}`,
            })),
          ),
        );
    },
  });

  // ============================================================
  // DATOS TEMPORALES
  // ============================================================

  /**
   * Mock de citas.
   *
   * TODO: reemplazar posteriormente por las citas
   * obtenidas desde la API.
   */
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

  protected readonly minDate = new Date()
    .toISOString()
    .split('T')[0];

  protected readonly items: readonly TuiTime[] =
    tuiCreateTimePeriods(9, 19, [0, 30]);

  protected readonly chips: readonly TuiTime[] =
    tuiCreateTimePeriods(9, 21, [0, 30]);

  protected selected = 'Wi-Fi';

  // ============================================================
  // FORMULARIO
  // ============================================================

  protected readonly form = new FormGroup({
    specialtyId: new FormControl<number | null>(
      null,
      Validators.required,
    ),

    patientId: new FormControl<number | null>(
      null,
      Validators.required,
    ),

    doctorId: new FormControl<number | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),

    appointmentTypeId: new FormControl<number | null>(
      null,
      Validators.required,
    ),

    scheduledDate: new FormControl<TuiDay | null>(
      null,
      Validators.required,
    ),

    scheduledTime: new FormControl<string | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),

    durationMinutes: new FormControl<number>(30, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(1),
      ],
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
    /**
     * Cuando cambia la especialidad:
     * - Limpia el médico seleccionado.
     * - Habilita/deshabilita el campo médico.
     * - Actualiza el signal que dispara doctorData.
     */
    this.form.controls.specialtyId.valueChanges.subscribe(
      specialtyId => {
        const doctorControl = this.form.controls.doctorId;

        doctorControl.reset();

        if (specialtyId) {
          doctorControl.enable();
        } else {
          doctorControl.disable();
        }

        this.specialtyId.set(specialtyId);
      },
    );

    /**
     * Cuando cambia la fecha:
     * - Limpia la hora.
     * - Habilita/deshabilita las horas.
     */
    this.form.controls.scheduledDate.valueChanges.subscribe(
      scheduledDate => {
        const timeControl =
          this.form.controls.scheduledTime;

        timeControl.reset();

        if (scheduledDate) {
          timeControl.enable();
        } else {
          timeControl.disable();
        }
      },
    );

    /**
     * Si cambia la duración:
     * se debe volver a seleccionar la hora.
     */
    this.form.controls.durationMinutes.valueChanges.subscribe(() => {
      this.form.controls.scheduledTime.reset();
    });
  }

  // ============================================================
  // HORARIOS
  // ============================================================

  protected readonly disabledTime = (
    time: TuiTime,
  ): boolean => {
    const selectedDate =
      this.form.controls.scheduledDate.value;

    const selectedDoctor =
      this.form.controls.doctorId.value;

    const duration =
      this.form.controls.durationMinutes.value;

    if (!selectedDate || !selectedDoctor || !duration) {
      return true;
    }

    // Bloquear horas pasadas si es hoy
    if (selectedDate.daySame(this.today)) {
      const currentTime = new Date();

      const currentTimeObj = new TuiTime(
        currentTime.getHours(),
        currentTime.getMinutes(),
      );

      if (
        time.valueOf() < currentTimeObj.valueOf()
      ) {
        return true;
      }
    }

    // Citas del doctor en la fecha seleccionada
    const doctorAppointments =
      this.appointments.filter(
        appointment =>
          // TODO: habilitar cuando se consulte la API
          // appointment.doctorId === selectedDoctor &&
          this.isSameDate(
            appointment.scheduledAt,
            selectedDate,
          ),
      );

    // Inicio de la nueva cita
    const selectedStart = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      time.hours,
      time.minutes,
    );

    // Fin según duración
    const selectedEnd = new Date(
      selectedStart.getTime() +
        duration * 60_000,
    );

    // Verificar cruces
    return doctorAppointments.some(appointment => {
      const appointmentStart =
        new Date(appointment.scheduledAt);

      const appointmentEnd = new Date(
        appointmentStart.getTime() +
          appointment.durationMinutes * 60_000,
      );

      return (
        selectedStart < appointmentEnd &&
        selectedEnd > appointmentStart
      );
    });
  };

  protected getTimeAppearance(
    chip: TuiTime,
  ): string {
    if (
      chip.toString('HH:MM') ===
      this.form.controls.scheduledTime.value
    ) {
      return 'accent';
    }

    if (this.disabledTime(chip)) {
      return 'action-grayscale';
    }

    return 'outline';
  }

  protected onTimeClicked(
    time: string,
  ): void {
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
  // STRINGIFY
  // ============================================================

  protected readonly stringifySpecialty = (
    value: unknown,
  ): string => {
    const id = Number(value);

    return (
      this.appointmentData
        .value()
        ?.specialties
        .find(specialty => specialty.id === id)
        ?.value ?? ''
    );
  };

  protected readonly stringifyPatient = (
    value: unknown,
  ): string => {
    const id = Number(value);

    return (
      this.appointmentData
        .value()
        ?.patients
        .find(patient => patient.id === id)
        ?.value ?? ''
    );
  };

  protected readonly stringifyAppointmentType = (
    value: unknown,
  ): string => {
    const id = Number(value);

    return (
      this.appointmentData
        .value()
        ?.appointmentTypes
        .find(type => type.id === id)
        ?.value ?? ''
    );
  };

  protected readonly stringifyDoctor = (
    value: unknown,
  ): string => {
    const id = Number(value);

    return (
      this.doctorData
        .value()
        ?.find(doctor => doctor.id === id)
        ?.value ?? ''
    );
  };

  // ============================================================
  // HELPERS
  // ============================================================

  private isSameDate(
    scheduledAt: string,
    selectedDate: TuiDay,
  ): boolean {
    const appointmentDate = new Date(scheduledAt);

    return (
      appointmentDate.getFullYear() ===
        selectedDate.year &&
      appointmentDate.getMonth() ===
        selectedDate.month &&
      appointmentDate.getDate() ===
        selectedDate.day
    );
  }
}