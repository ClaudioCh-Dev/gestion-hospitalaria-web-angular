import { Component, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { rxResource } from '@angular/core/rxjs-interop';

import { forkJoin, map, of, tap } from 'rxjs';

import { TuiDay, TuiPlatform, TuiTime } from '@taiga-ui/cdk';

import {
  TuiButton,
  TuiCalendar,
  TuiDataList,
  TuiError,
  TuiLabel,
  TuiLoader,
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
import { AppointmentService } from '@appointment/services/appointment.service';

import { FormOption } from '@shared/components/modal-form/modal-form';

import { CreateAppointmentRequest } from '@appointment/interfaces';
import { withNotification } from '@shared/operators/with-notification';
import { NotificationService } from '@core/services/alert-notification.service';

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
    TuiLoader,
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
  // DEPENDENCIAS
  // ============================================================

  private readonly doctorService = inject(DoctorService);

  private readonly patientService = inject(PatientService);

  private readonly appointmentTypeService = inject(AppointmentTypeService);

  private readonly appointmentService = inject(AppointmentService);

  private readonly router = inject(Router);

  private readonly notificationService = inject(NotificationService);

  // ============================================================
  // SIGNALS
  // ============================================================

  /**
   * Especialidad seleccionada.
   *
   * Dispara doctorData.
   */
  protected readonly specialtyId = signal<number | null>(null);

  /**
   * Doctor seleccionado.
   *
   * Dispara appointmentDataByDate.
   */
  protected readonly doctorId = signal<number | null>(null);

  /**
   * Fecha seleccionada.
   *
   * Dispara appointmentDataByDate.
   */
  protected readonly scheduledDate = signal<TuiDay | null>(null);

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
            types.map((type) => ({
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

  /**
   * Obtiene los doctores según la especialidad.
   */
  protected readonly doctorData = rxResource({
    params: () => ({
      specialtyId: this.specialtyId(),
    }),

    stream: ({ params }) => {
      if (!params.specialtyId) {
        return of([]);
      }

      return this.doctorService.findBySpecialty(params.specialtyId, 0, 100).pipe(
        map((response) =>
          response.content.map((doctor) => ({
            id: doctor.id,
            value: `${doctor.firstName} ${doctor.lastName}`,
          })),
        ),
      );
    },
  });

  // ============================================================
  // RECURSO - CITAS POR FECHA Y DOCTOR
  // ============================================================

  /**
   * Obtiene las citas disponibles/ocupadas
   * para el doctor y fecha seleccionados.
   *
   * Se vuelve a ejecutar cuando cambia:
   *
   * - doctorId
   * - scheduledDate
   */
  protected readonly appointmentDataByDate = rxResource({
    params: () => ({
      doctorId: this.doctorId(),

      date: this.scheduledDate(),
    }),

    stream: ({ params }) => {
      /**
       * Si todavía no hay doctor o fecha,
       * no hacemos llamada HTTP.
       */
      if (!params.doctorId || !params.date) {
        return of([]);
      }

      /**
       * TuiDay → YYYY-MM-DD
       */
      const date = this.formatDate(params.date);

      /**
       * La API devuelve las citas de la fecha.
       *
       * Después filtramos solamente las
       * correspondientes al doctor seleccionado.
       */
      return this.appointmentService
        .findByDate(date)
        .pipe(
          map((appointments) =>
            appointments.filter((appointment) => appointment.doctorId === params.doctorId),
          ),
        );
    },
  });

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
    // ==========================================================
    // ESPECIALIDAD
    // ==========================================================

    this.form.controls.specialtyId.valueChanges.subscribe((specialtyId) => {
      const doctorControl = this.form.controls.doctorId;

      /**
       * Al cambiar especialidad,
       * eliminamos el doctor anterior.
       */
      doctorControl.reset();

      if (specialtyId) {
        doctorControl.enable();
      } else {
        doctorControl.disable();
      }

      /**
       * Actualiza el signal que dispara
       * doctorData.
       */
      this.specialtyId.set(specialtyId);
    });

    // ==========================================================
    // DOCTOR
    // ==========================================================

    this.form.controls.doctorId.valueChanges.subscribe((doctorId) => {
      /**
       * Actualiza el signal que utiliza
       * appointmentDataByDate.
       */
      this.doctorId.set(doctorId);
    });

    // ==========================================================
    // FECHA
    // ==========================================================

    this.form.controls.scheduledDate.valueChanges.subscribe((scheduledDate) => {
      const timeControl = this.form.controls.scheduledTime;

      /**
       * Al cambiar fecha debemos
       * volver a seleccionar hora.
       */
      timeControl.reset();

      if (scheduledDate) {
        timeControl.enable();
      } else {
        timeControl.disable();
      }

      /**
       * Actualiza el signal que utiliza
       * appointmentDataByDate.
       */
      this.scheduledDate.set(scheduledDate);
    });

    // ==========================================================
    // DURACIÓN
    // ==========================================================

    this.form.controls.durationMinutes.valueChanges.subscribe(() => {
      /**
       * Al cambiar duración,
       * la hora seleccionada deja de ser
       * necesariamente válida.
       */
      this.form.controls.scheduledTime.reset();
    });
  }

  // ============================================================
  // HORARIOS
  // ============================================================

  protected readonly disabledTime = (time: TuiTime): boolean => {
    const selectedDate = this.form.controls.scheduledDate.value;

    const selectedDoctor = this.form.controls.doctorId.value;

    const duration = this.form.controls.durationMinutes.value;

    // ==========================================================
    // VALIDACIONES INICIALES
    // ==========================================================

    if (!selectedDate || !selectedDoctor || !duration) {
      return true;
    }

    // ==========================================================
    // HORAS PASADAS
    // ==========================================================

    if (selectedDate.daySame(this.today)) {
      const currentTime = new Date();

      const currentTimeObj = new TuiTime(currentTime.getHours(), currentTime.getMinutes());

      if (time.valueOf() < currentTimeObj.valueOf()) {
        return true;
      }
    }

    // ==========================================================
    // INICIO DE LA NUEVA CITA
    // ==========================================================

    const selectedStart = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      time.hours,
      time.minutes,
    );

    // ==========================================================
    // FIN DE LA NUEVA CITA
    // ==========================================================

    const selectedEnd = new Date(selectedStart.getTime() + duration * 60_000);

    // ==========================================================
    // CITAS DEL RESOURCE
    // ==========================================================

    /**
     * appointmentDataByDate ya contiene
     * únicamente las citas del doctor
     * y fecha seleccionados.
     *
     * Aquí solamente verificamos
     * si existe algún solapamiento.
     */
    return (
      this.appointmentDataByDate.value()?.some((appointment) => {
        const appointmentStart = new Date(appointment.scheduledAt);

        const appointmentEnd = new Date(
          appointmentStart.getTime() + appointment.durationMinutes * 60_000,
        );

        /**
         * Existe solapamiento cuando:
         *
         * inicio nueva < fin existente
         *
         * &&
         *
         * fin nueva > inicio existente
         */
        return selectedStart < appointmentEnd && selectedEnd > appointmentStart;
      }) ?? false
    );
  };

  // ============================================================
  // APARIENCIA DEL CHIP
  // ============================================================

  protected getTimeAppearance(chip: TuiTime): string {
    if (chip.toString('HH:MM') === this.form.controls.scheduledTime.value) {
      return 'accent';
    }

    if (this.disabledTime(chip)) {
      return 'action-grayscale';
    }

    return 'outline';
  }

  // ============================================================
  // CLICK EN HORA
  // ============================================================

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

  /**
   * Convierte TuiDay a YYYY-MM-DD.
   *
   * Ejemplo:
   *
   * TuiDay(2026, 8, 17)
   *       ↓
   * 2026-09-17
   */
  private formatDate(date: TuiDay): string {
    const year = date.year;

    const month = String(date.month + 1).padStart(2, '0');

    const day = String(date.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
