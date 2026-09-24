import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { forkJoin, map, of } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';

import {
  TuiButton,
  TuiCalendar,
  TuiDataList,
  TuiError,
  TuiIcon,
  TuiLabel,
  TuiLoader,
  TuiTextfield,
  tuiValidationErrorsProvider,
} from '@taiga-ui/core';

import { TuiSelect, TuiTextarea } from '@taiga-ui/kit';

import { TuiForm } from '@taiga-ui/layout';

import { DoctorService } from '@doctors/services/doctor.service';
import { PatientService } from '@patients/services/patient.service';
import { AppointmentTypeService } from '@appointment/services/appointment-type.service';
import { AppointmentService } from '@appointment/services/appointment.service';

import { FormOption } from '@shared/components/modal-form/modal-form';

import {
  AppointmentResponse,
  AppointmentStatus,
  CreateAppointmentRequest,
} from '@appointment/interfaces';
import { withNotification } from '@shared/operators/with-notification';
import { NotificationService } from '@core/services/alert-notification.service';

interface DoctorOption extends FormOption {
  // Minutos desde las 00:00
  scheduleStart: number;
  scheduleEnd: number;
}

export type SlotState =
  | 'available'
  | 'selected'
  // Dentro del bloque de la cita seleccionada (después del inicio)
  | 'covered'
  | 'busy'
  | 'patient-busy'
  | 'past';

export interface TimeSlot {
  time: string;
  start: number;
  state: SlotState;
  hint: string;
}

interface SlotGroup {
  label: string;
  icon: string;
  slots: TimeSlot[];
}

const SLOT_STEP_MINUTES = 30;

// Horario por defecto si el médico no tiene uno configurado (mismo rango que la agenda)
const DEFAULT_SCHEDULE_START = 8 * 60;
const DEFAULT_SCHEDULE_END = 22 * 60 + 30;

@Component({
  selector: 'app-appointment-create-page',

  imports: [
    ReactiveFormsModule,
    RouterLink,

    // Taiga UI
    TuiButton,
    TuiTextfield,
    TuiDataList,
    TuiCalendar,
    TuiSelect,
    TuiTextarea,
    TuiError,
    TuiForm,
    TuiIcon,
    TuiLabel,
    TuiLoader,
  ],

  providers: [
    tuiValidationErrorsProvider({
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

  private readonly appointmentService = inject(AppointmentService);

  private readonly router = inject(Router);

  private readonly notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

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

  // ============================================================
  // SIGNALS DEL FORMULARIO
  // ============================================================

  private readonly controls = this.form.controls;

  protected readonly specialtyId = toSignal(this.controls.specialtyId.valueChanges, {
    initialValue: null,
  });

  protected readonly doctorId = toSignal(this.controls.doctorId.valueChanges, {
    initialValue: null,
  });

  protected readonly patientId = toSignal(this.controls.patientId.valueChanges, {
    initialValue: null,
  });

  protected readonly scheduledDate = toSignal(this.controls.scheduledDate.valueChanges, {
    initialValue: null,
  });

  protected readonly scheduledTime = toSignal(this.controls.scheduledTime.valueChanges, {
    initialValue: null,
  });

  protected readonly durationMinutes = toSignal(this.controls.durationMinutes.valueChanges, {
    initialValue: this.controls.durationMinutes.value,
  });

  // Se actualiza cada minuto para que las horas que van pasando se bloqueen solas
  private readonly now = signal(new Date());

  // ============================================================
  // RECURSO - DATOS INICIALES
  // ============================================================

  /**
   * Carga:
   *
   * - Especialidades
   * - Pacientes
   * - Tipos de cita
   */
  protected readonly appointmentData = rxResource({
    stream: () =>
      forkJoin({
        specialties: this.doctorService.findAllSpecialties().pipe(
          map((specialties) =>
            specialties.map((specialty) => ({
              id: specialty.id,
              value: specialty.name,
            })),
          ),
        ),

        patients: this.patientService.findAll(0, 100).pipe(
          map((response) =>
            response.content.map((patient) => ({
              id: patient.id,
              value: `${patient.firstName} ${patient.lastName}`,
            })),
          ),
        ),

        appointmentTypes: this.appointmentTypeService.findAll().pipe(
          map((types) =>
            types
              .filter((type) => type.active)
              .map((type) => ({
                id: type.id,
                value: type.title,
              })),
          ),
        ),
      }),
  });

  // ============================================================
  // RECURSO - DOCTORES POR ESPECIALIDAD
  // ============================================================

  protected readonly doctorData = rxResource({
    params: () => ({
      specialtyId: this.specialtyId(),
    }),

    stream: ({ params }) => {
      if (!params.specialtyId) {
        return of<DoctorOption[]>([]);
      }

      return this.doctorService.findBySpecialty(params.specialtyId, 0, 100).pipe(
        map((response) =>
          response.content.map(
            (doctor): DoctorOption => ({
              id: doctor.id,
              value: `${doctor.firstName} ${doctor.lastName}`,
              scheduleStart: doctor.scheduleStart
                ? this.toMinutes(doctor.scheduleStart)
                : DEFAULT_SCHEDULE_START,
              scheduleEnd: doctor.scheduleEnd
                ? this.toMinutes(doctor.scheduleEnd)
                : DEFAULT_SCHEDULE_END,
            }),
          ),
        ),
      );
    },
  });

  // ============================================================
  // RECURSO - CITAS DEL DÍA
  // ============================================================

  /**
   * Todas las citas (no canceladas) de la fecha elegida.
   *
   * Solo depende de la fecha: cambiar de médico o de paciente
   * se resuelve filtrando en memoria, sin volver a llamar a la API.
   */
  protected readonly dayAppointments = rxResource({
    params: () => ({
      date: this.scheduledDate(),
    }),

    stream: ({ params }) => {
      if (!params.date) {
        return of<AppointmentResponse[]>([]);
      }

      return this.appointmentService
        .findByDate(this.formatDate(params.date))
        .pipe(
          map((appointments) =>
            appointments.filter(
              (appointment) => appointment.status !== AppointmentStatus.CANCELLED,
            ),
          ),
        );
    },
  });

  // ============================================================
  // FECHA
  // ============================================================

  protected readonly today = TuiDay.currentLocal();

  protected readonly maxDay = this.today.append({
    month: 2,
  });

  protected readonly durationOptions = [30, 45, 60, 90, 120];

  protected readonly slotClasses: Record<SlotState, string> = {
    available:
      'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-(--tui-background-accent-1) hover:text-(--tui-background-accent-1)',
    selected: 'cursor-pointer border-transparent bg-(--tui-background-accent-1) text-white shadow-sm',
    covered: 'cursor-pointer border-blue-200 bg-blue-50 text-blue-700',
    busy: 'cursor-not-allowed border-slate-200 bg-[repeating-linear-gradient(135deg,rgb(148_163_184/0.18)_0px,rgb(148_163_184/0.18)_1px,transparent_1px,transparent_6px)] bg-slate-50 text-slate-400 line-through',
    'patient-busy': 'cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600/70 line-through',
    past: 'cursor-not-allowed border-dashed border-slate-200 bg-white text-slate-300',
  };

  // ============================================================
  // DISPONIBILIDAD
  // ============================================================

  protected readonly selectedDoctor = computed(() =>
    this.doctorData.value()?.find((doctor) => doctor.id === this.doctorId()),
  );

  // Faltan datos para calcular horarios
  protected readonly missingForSlots = computed(() => {
    const missing: string[] = [];

    if (!this.doctorId()) {
      missing.push('un médico');
    }

    if (!this.scheduledDate()) {
      missing.push('una fecha');
    }

    return missing;
  });

  protected readonly slots = computed<TimeSlot[]>(() => {
    const doctor = this.selectedDoctor();
    const date = this.scheduledDate();
    const duration = this.durationMinutes();

    if (!doctor || !date || !duration) {
      return [];
    }

    const appointments = this.dayAppointments.value() ?? [];
    const patientId = this.patientId();

    const toRange = (appointment: AppointmentResponse) => {
      const start = this.toMinutes(appointment.scheduledAt.split('T')[1] ?? '');

      return { start, end: start + appointment.durationMinutes };
    };

    const doctorBusy = appointments
      .filter((appointment) => appointment.doctorId === doctor.id)
      .map(toRange);

    const patientBusy = patientId
      ? appointments
          .filter(
            (appointment) =>
              appointment.patientId === patientId && appointment.doctorId !== doctor.id,
          )
          .map(toRange)
      : [];

    const now = this.now();
    const nowMinutes = date.daySame(this.today)
      ? now.getHours() * 60 + now.getMinutes()
      : -1;

    const selected = this.scheduledTime();
    const selectedStart = selected ? this.toMinutes(selected) : null;

    const overlaps = (start: number, end: number, ranges: { start: number; end: number }[]) =>
      ranges.some((range) => start < range.end && end > range.start);

    const result: TimeSlot[] = [];

    // Solo horas en las que la cita completa cabe dentro del horario del médico
    for (
      let start = doctor.scheduleStart;
      start + duration <= doctor.scheduleEnd;
      start += SLOT_STEP_MINUTES
    ) {
      const end = start + duration;
      const time = this.fromMinutes(start);
      const range = `${time} - ${this.fromMinutes(end)}`;

      let state: SlotState = 'available';
      let hint = `Disponible: ${range}`;

      if (start < nowMinutes) {
        state = 'past';
        hint = 'Hora pasada';
      } else if (overlaps(start, end, doctorBusy)) {
        state = 'busy';
        hint = `El médico tiene otra cita en ${range}`;
      } else if (overlaps(start, end, patientBusy)) {
        state = 'patient-busy';
        hint = `El paciente tiene otra cita en ${range}`;
      } else if (selectedStart === start) {
        state = 'selected';
        hint = `Seleccionado: ${range}`;
      } else if (
        selectedStart !== null &&
        start > selectedStart &&
        start < selectedStart + duration
      ) {
        state = 'covered';
        hint = 'Parte de la cita seleccionada';
      }

      result.push({ time, start, state, hint });
    }

    return result;
  });

  protected readonly slotGroups = computed<SlotGroup[]>(() => {
    const slots = this.slots();

    return [
      {
        label: 'Mañana',
        icon: '@tui.sunrise',
        slots: slots.filter((slot) => slot.start < 12 * 60),
      },
      {
        label: 'Tarde',
        icon: '@tui.sun',
        slots: slots.filter((slot) => slot.start >= 12 * 60 && slot.start < 18 * 60),
      },
      {
        label: 'Noche',
        icon: '@tui.moon',
        slots: slots.filter((slot) => slot.start >= 18 * 60),
      },
    ].filter((group) => group.slots.length);
  });

  protected readonly availableCount = computed(
    () =>
      this.slots().filter((slot) => slot.state === 'available' || slot.state === 'selected')
        .length,
  );

  protected readonly selectionSummary = computed(() => {
    const time = this.scheduledTime();
    const date = this.scheduledDate();

    if (!time || !date) {
      return null;
    }

    const end = this.fromMinutes(this.toMinutes(time) + this.durationMinutes());

    return {
      date: this.formatLongDate(date),
      range: `${time} - ${end}`,
    };
  });

  protected readonly scheduleLabel = computed(() => {
    const doctor = this.selectedDoctor();

    return doctor
      ? `${this.fromMinutes(doctor.scheduleStart)} - ${this.fromMinutes(doctor.scheduleEnd)}`
      : '';
  });

  protected readonly dateTitle = computed(() => {
    const date = this.scheduledDate();

    return date ? this.formatLongDate(date) : '';
  });

  protected readonly canGoNextDay = computed(() => {
    const date = this.scheduledDate();

    return !!date && date.dayBefore(this.maxDay);
  });

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor() {
    // Al cambiar especialidad se elimina el médico anterior
    this.controls.specialtyId.valueChanges.subscribe((specialtyId) => {
      const doctorControl = this.controls.doctorId;

      doctorControl.reset();

      if (specialtyId) {
        doctorControl.enable();
      } else {
        doctorControl.disable();
      }
    });

    // Otro médico u otra fecha: la disponibilidad es distinta, se vuelve a elegir hora
    this.controls.doctorId.valueChanges.subscribe(() => this.controls.scheduledTime.reset());

    this.controls.scheduledDate.valueChanges.subscribe(() =>
      this.controls.scheduledTime.reset(),
    );

    // Otra duración u otro paciente: se conserva la hora solo si sigue libre
    this.controls.durationMinutes.valueChanges.subscribe(() => this.keepTimeIfAvailable());

    this.controls.patientId.valueChanges.subscribe(() => this.keepTimeIfAvailable());

    this.startClock();
  }

  // ============================================================
  // ACCIONES DE HORARIO
  // ============================================================

  protected selectDay(day: TuiDay): void {
    this.controls.scheduledDate.setValue(day);
  }

  protected selectDuration(minutes: number): void {
    this.controls.durationMinutes.setValue(minutes);
  }

  protected selectSlot(slot: TimeSlot): void {
    if (slot.state !== 'available' && slot.state !== 'covered') {
      return;
    }

    this.controls.scheduledTime.setValue(slot.time);
    this.controls.scheduledTime.markAsTouched();
  }

  protected nextDay(): void {
    const next = this.scheduledDate()?.append({ day: 1 });

    if (next && !next.dayAfter(this.maxDay)) {
      this.selectDay(next);
    }
  }

  // Días fuera de rango no seleccionables en el calendario
  protected readonly disabledDay = (day: TuiDay): boolean =>
    day.dayBefore(this.today) || day.dayAfter(this.maxDay);

  private keepTimeIfAvailable(): void {
    const time = this.controls.scheduledTime.value;

    if (!time) {
      return;
    }

    const slot = this.slots().find((item) => item.time === time);

    if (!slot || (slot.state !== 'selected' && slot.state !== 'available')) {
      this.controls.scheduledTime.reset();
    }
  }

  private startClock(): void {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      this.now.set(new Date());
      intervalId = setInterval(() => this.now.set(new Date()), 60_000);
    }, 60_000 - (Date.now() % 60_000));

    this.destroyRef.onDestroy(() => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    });
  }

  // ============================================================
  // CREAR CITA
  // ============================================================

  protected create(): void {
    const time = this.controls.scheduledTime.value;
    const slot = this.slots().find((item) => item.time === time);

    // La hora pudo quedar en el pasado u ocupada mientras se llenaba el formulario
    if (time && slot?.state !== 'selected') {
      this.controls.scheduledTime.reset();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: CreateAppointmentRequest = {
      patientId: value.patientId!,
      doctorId: value.doctorId!,
      appointmentTypeId: value.appointmentTypeId!,
      scheduledAt: `${this.formatDate(value.scheduledDate!)}T${value.scheduledTime}:00`,
      durationMinutes: value.durationMinutes,
      reason: value.reason,
      notes: value.notes,
    };

    this.appointmentService
      .create(request)
      .pipe(
        withNotification(this.notificationService, {
          success: 'Cita creada correctamente',
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/appointments']);
        },
      });
  }

  // ============================================================
  // STRINGIFY
  // ============================================================

  protected readonly stringifySpecialty = (value: unknown): string => {
    const id = Number(value);

    return (
      this.appointmentData.value()?.specialties.find((specialty) => specialty.id === id)?.value ??
      ''
    );
  };

  protected readonly stringifyPatient = (value: unknown): string => {
    const id = Number(value);

    return this.appointmentData.value()?.patients.find((patient) => patient.id === id)?.value ?? '';
  };

  protected readonly stringifyAppointmentType = (value: unknown): string => {
    const id = Number(value);

    return (
      this.appointmentData.value()?.appointmentTypes.find((type) => type.id === id)?.value ?? ''
    );
  };

  protected readonly stringifyDoctor = (value: unknown): string => {
    const id = Number(value);

    return this.doctorData.value()?.find((doctor) => doctor.id === id)?.value ?? '';
  };

  // ============================================================
  // HELPERS
  // ============================================================

  /** TuiDay → YYYY-MM-DD */
  private formatDate(date: TuiDay): string {
    const year = date.year;

    const month = String(date.month + 1).padStart(2, '0');

    const day = String(date.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatLongDate(date: TuiDay): string {
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(date.year, date.month, date.day));
  }

  /** HH:mm o HH:mm:ss → minutos desde las 00:00 */
  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  /** minutos desde las 00:00 → HH:mm */
  private fromMinutes(total: number): string {
    return [Math.floor(total / 60), total % 60]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }
}
