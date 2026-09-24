import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiCalendar,
  TuiDialogService,
  TuiHint,
  TuiTextfield,
} from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { TuiInputDate } from '@taiga-ui/kit';

import { AppointmentService } from '../../services/appointment.service';
import { AppointmentTypeService } from '../../services/appointment-type.service';
import { getAppointmentTypeColor } from '../../constants/appointment-type-colors';
import { DoctorService } from '../../../doctor/services/doctor.service';

import {
  AppointmentResponse,
  AppointmentStatus,
} from '../../interfaces';
import {
  AppointmentDetailData,
  AppointmentDetailDialog,
} from '../appointment-detail-dialog/appointment-detail-dialog';

import {
  DoctorResponse,
} from '../../../doctor/interfaces';
import { AvatarDefaultDoctorPipe } from '@shared/pipes/avatar-default-doctor-pipe';
import { StateMessage } from '@shared/components/state-message/state-message';

@Component({
  selector: 'app-cell-calendar-admin',
  imports: [
    StateMessage,
    FormsModule,
    NgClass,
    TuiButton,
    TuiTextfield,
    TuiCalendar,
    TuiHint,
    TuiInputDate,
    AvatarDefaultDoctorPipe,
  ],
  templateUrl: './cell-calendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellCalendarAdmin {

  private readonly appointmentService =
    inject(AppointmentService);

  private readonly doctorService =
    inject(DoctorService);

  private readonly appointmentTypeService =
    inject(AppointmentTypeService);

  private readonly dialogs =
    inject(TuiDialogService);

  private readonly destroyRef =
    inject(DestroyRef);

  // =========================
  // DATE
  // =========================

  protected readonly today =
    TuiDay.currentLocal();

  protected readonly min =
    new TuiDay(
      this.today.year,
      this.today.month,
      1,
    );

  protected readonly max =
    this.min.append({
      month: 1,
      day: -1,
    });

  protected readonly handler =
    (day: TuiDay): boolean =>
      day.daySame(this.today);

  protected readonly selectedDate =
    signal(TuiDay.currentLocal());

  protected readonly defaultActiveMonth =
    signal(TuiDay.currentLocal());

  // =========================
  // CURRENT TIME
  // =========================

  private static readonly DAY_START_MINUTES = 8 * 60;

  private static readonly DAY_END_MINUTES = 22 * 60 + 30;

  private readonly now =
    signal(new Date());

  protected readonly isToday =
    computed(() => {
      const now = this.now();
      const date = this.selectedDate();

      return (
        date.year === now.getFullYear() &&
        date.month === now.getMonth() &&
        date.day === now.getDate()
      );
    });

  protected readonly nowLabel =
    computed(() =>
      [
        this.now().getHours(),
        this.now().getMinutes(),
      ]
        .map(value => value.toString().padStart(2, '0'))
        .join(':'),
    );

  /** Porcentaje (0-100) del ancho de horas transcurrido; null si hoy no está visible o fuera del horario. */
  protected readonly nowPercent =
    computed(() => {
      if (!this.isToday()) {
        return null;
      }

      const now = this.now();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const start = CellCalendarAdmin.DAY_START_MINUTES;
      const end = CellCalendarAdmin.DAY_END_MINUTES;

      if (minutes <= start) {
        return null;
      }

      return Math.min(minutes - start, end - start) / (end - start) * 100;
    });

  protected readonly showNowLine =
    computed(() => {
      const percent = this.nowPercent();

      return percent !== null && percent < 100;
    });

  constructor() {
    this.startClock();
  }

  private startClock(): void {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    // Sincroniza con el inicio del siguiente minuto y luego actualiza cada 60 s.
    const timeoutId = setTimeout(() => {
      this.now.set(new Date());
      intervalId = setInterval(() => this.now.set(new Date()), 60_000);
    }, 60_000 - (Date.now() % 60_000));

    this.destroyRef.onDestroy(() => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    });
  }

  // =========================
  // CALENDAR RESOURCE
  // =========================

  protected readonly calendarResource =
    rxResource({
      params: () => ({
        date: this.formatDate(
          this.selectedDate(),
        ),
      }),

      stream: ({ params }) =>
        forkJoin({
          doctors: this.doctorService.findAll(0, 100),
          appointmentTypes:
            this.appointmentTypeService.findAll(),
          appointments:
            this.appointmentService.findByDate(
              params.date,
            ),
        }),
    });

  // =========================
  // APPOINTMENT TYPE COLORS
  // =========================

  private readonly typeColors =
    computed(() =>
      new Map(
        (this.calendarResource.value()?.appointmentTypes ?? [])
          .map(type => [type.id, type.color]),
      ),
    );

  // =========================
  // HOURS
  // =========================

  protected readonly hours =
    this.generateHours();

  // =========================
  // DOCTORS
  // =========================

  protected get doctors(): DoctorResponse[] {
    return this.calendarResource.value()
      ?.doctors.content ?? [];
  }

  // =========================
  // APPOINTMENTS
  // =========================

  protected get appointments(): AppointmentResponse[] {
    return this.calendarResource.value()
      ?.appointments ?? [];
  }

  // =========================
  // DATE NAVIGATION
  // =========================

  protected previousDay(): void {
    this.selectedDate.update(date =>
      date.append({
        day: -1,
      }),
    );

    this.defaultActiveMonth.set(
      this.selectedDate(),
    );
  }

  protected nextDay(): void {
    this.selectedDate.update(date =>
      date.append({
        day: 1,
      }),
    );

    this.defaultActiveMonth.set(
      this.selectedDate(),
    );
  }

  protected goToday(): void {
    const today =
      TuiDay.currentLocal();

    this.selectedDate.set(today);
    this.defaultActiveMonth.set(today);
  }

  protected onDateChange(
    date: TuiDay,
  ): void {

    if (!date) {
      return;
    }

    this.selectedDate.set(date);
    this.defaultActiveMonth.set(date);
  }

  // =========================
  // DATE TITLE
  // =========================

  protected getDayTitle(): string {

    const date =
      this.selectedDate();

    const jsDate = new Date(
      date.year,
      date.month,
      date.day,
    );

    return new Intl.DateTimeFormat(
      'es-PE',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    ).format(jsDate);
  }

  // =========================
  // FORMAT DATE
  // =========================

  private formatDate(
    date: TuiDay,
  ): string {

    return [
      date.year,
      String(date.month + 1).padStart(2, '0'),
      String(date.day).padStart(2, '0'),
    ].join('-');
  }

  // =========================
  // HOURS
  // =========================

  private generateHours(): string[] {

    const hours: string[] = [];

    for (
      let hour = 8;
      hour <= 21;
      hour++
    ) {
      hours.push(
        `${hour.toString().padStart(2, '0')}:00`,
      );

      hours.push(
        `${hour.toString().padStart(2, '0')}:30`,
      );
    }

    hours.push('22:00');

    return hours;
  }

  // =========================
  // APPOINTMENT
  // =========================

  protected getAppointment(
    doctorId: number,
    time: string,
  ): AppointmentResponse | undefined {

    return this.appointments.find(
      appointment =>
        appointment.doctorId === doctorId &&
        this.getTime(
          appointment.scheduledAt,
        ) === time,
    );
  }

  // =========================
  // APPOINTMENT WIDTH
  // =========================

  protected getAppointmentCells(
    appointment: AppointmentResponse,
  ): number {

    const start =
      this.getTime(
        appointment.scheduledAt,
      );

    const end =
      this.addMinutes(
        start,
        appointment.durationMinutes,
      );

    return (
      this.toMinutes(end) -
      this.toMinutes(start)
    ) / 30;
  }

  // =========================
  // APPOINTMENT COLOR
  // =========================

  protected getAppointmentColor(
    appointment: AppointmentResponse,
  ): string {

    return getAppointmentTypeColor(
      this.typeColors().get(
        appointment.appointmentTypeId,
      ),
    ).classes;
  }

  // =========================
  // FINAL STATUS
  // =========================

  protected isFinished(
    appointment: AppointmentResponse,
  ): boolean {

    return (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    );
  }

  // =========================
  // APPOINTMENT DETAIL
  // =========================

  protected openAppointment(
    appointment: AppointmentResponse,
  ): void {

    const data: AppointmentDetailData = {
      appointment,
      doctor: this.doctors.find(
        doctor => doctor.id === appointment.doctorId,
      ),
    };

    this.dialogs
      .open<AppointmentResponse | null>(
        new PolymorpheusComponent(
          AppointmentDetailDialog,
        ),
        {
          label: 'Detalle de la cita',
          size: 'm',
          data,
        },
      )
      .subscribe(updated => {

        if (updated) {
          this.calendarResource.reload();
        }
      });
  }

  // =========================
  // TIME
  // =========================

  private getTime(
    dateTime: string,
  ): string {

    return (
      dateTime
        .split('T')[1]
        ?.slice(0, 5) ?? ''
    );
  }

  private addMinutes(
    time: string,
    minutes: number,
  ): string {

    const total =
      this.toMinutes(time) + minutes;

    const hours =
      Math.floor(total / 60);

    const mins =
      total % 60;

    return [
      hours.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
    ].join(':');
  }

  private toMinutes(
    time: string,
  ): number {

    const [
      hours,
      minutes,
    ] = time
      .split(':')
      .map(Number);

    return (
      hours * 60 +
      minutes
    );
  }
}