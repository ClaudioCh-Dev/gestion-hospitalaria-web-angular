import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiDay } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiCalendar,
  TuiHint,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiAvatar, TuiInputDate } from '@taiga-ui/kit';

@Component({
  selector: 'app-cell-callendar-admin',
  imports: [
    FormsModule,
    NgClass,
    TuiButton,
    TuiTextfield,
    TuiCalendar,
    TuiHint,
     TuiInputDate
  ],
  templateUrl: './cell-callendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellCallendarAdmin {

  // =========================
  // DATE
  // =========================

    protected readonly today = TuiDay.currentLocal();
    protected readonly min = new TuiDay(this.today.year, this.today.month, 1);
    protected readonly max = this.min.append({month: 1, day: -1});
    protected readonly handler = (day: TuiDay): boolean => day.daySame(this.today);
    protected selectedDateValue = TuiDay.currentLocal();

  defaultActiveMonth = signal(
    TuiDay.currentLocal(),
  );


  // =========================
  // DOCTORS
  // =========================

doctors = [
  {
    id: 1,
    name: 'Dr. García',
    specialty: 'Medicina general',
    email: 'garcia@hospital.com',
    phone: '+51 987 654 321',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 2,
    name: 'Dra. Torres',
    specialty: 'Cardiología',
    email: 'torres@hospital.com',
    phone: '+51 987 654 322',
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 3,
    name: 'Dr. Ramírez',
    specialty: 'Pediatría',
    email: 'ramirez@hospital.com',
    phone: '+51 987 654 323',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 4,
    name: 'Dra. López',
    specialty: 'Dermatología',
    email: 'lopez@hospital.com',
    phone: '+51 987 654 324',
    avatar: 'https://i.pravatar.cc/150?img=44',
  },
  {
    id: 5,
    name: 'Dr. Martínez',
    specialty: 'Traumatología',
    email: 'martinez@hospital.com',
    phone: '+51 987 654 325',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
];


  // =========================
  // HOURS
  // =========================

  hours = this.generateHours();


  // =========================
  // APPOINTMENTS
  // =========================

  appointments = [
    {
      doctorId: 1,
      start: '08:00',
      end: '09:00',
      patient: 'Juan Pérez',
      type: 'Consulta general',
    },
    {
      doctorId: 1,
      start: '10:00',
      end: '11:30',
      patient: 'Carlos Ruiz',
      type: 'Control médico',
    },
    {
      doctorId: 2,
      start: '09:00',
      end: '10:00',
      patient: 'María López',
      type: 'Consulta cardiológica',
    },
    {
      doctorId: 2,
      start: '11:00',
      end: '12:30',
      patient: 'Ana Torres',
      type: 'Electrocardiograma',
    },
    {
      doctorId: 3,
      start: '08:30',
      end: '09:30',
      patient: 'Pedro Sánchez',
      type: 'Consulta pediátrica',
    },
    {
      doctorId: 3,
      start: '13:00',
      end: '14:00',
      patient: 'Sofía Díaz',
      type: 'Control pediátrico',
    },
    {
      doctorId: 4,
      start: '10:30',
      end: '11:30',
      patient: 'Lucía Flores',
      type: 'Consulta dermatológica',
    },
    {
      doctorId: 4,
      start: '15:00',
      end: '16:30',
      patient: 'Diego Castro',
      type: 'Evaluación dermatológica',
    },
    {
      doctorId: 5,
      start: '09:30',
      end: '11:00',
      patient: 'Miguel Vargas',
      type: 'Consulta traumatológica',
    },
    {
      doctorId: 5,
      start: '14:00',
      end: '15:00',
      patient: 'Andrea Ruiz',
      type: 'Control traumatológico',
    },
  ];


  // =========================
  // APPOINTMENT COLORS
  // =========================

  appointmentColors = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-500 text-white',
    'bg-rose-600 text-white',
    'bg-cyan-600 text-white',
    'bg-indigo-600 text-white',
    'bg-orange-600 text-white',
    'bg-teal-600 text-white',
    'bg-pink-600 text-white',
  ];


  // =========================
  // DATE NAVIGATION
  // =========================

  previousDay(): void {
    this.selectedDateValue =
      this.selectedDateValue.append({
        day: -1,
      });

    this.defaultActiveMonth.set(
      this.selectedDateValue,
    );
  }


  nextDay(): void {
    this.selectedDateValue =
      this.selectedDateValue.append({
        day: 1,
      });

    this.defaultActiveMonth.set(
      this.selectedDateValue,
    );
  }


  goToday(): void {
    this.selectedDateValue =
      TuiDay.currentLocal();

    this.defaultActiveMonth.set(
      this.selectedDateValue,
    );
  }


  // =========================
  // DATE TITLE
  // =========================

  getDayTitle(): string {
    const date = this.selectedDateValue;

    const jsDate = new Date(
      date.year,
      date.month,
      date.day,
    );

    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(jsDate);
  }


  // =========================
  // HOURS
  // =========================

  private generateHours(): string[] {
    const hours: string[] = [];

    for (let hour = 8; hour <= 21; hour++) {
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

  getAppointment(
    doctorId: number,
    time: string,
  ) {
    return this.appointments.find(
      appointment =>
        appointment.doctorId === doctorId &&
        appointment.start === time,
    );
  }


  // =========================
  // APPOINTMENT WIDTH
  // =========================

  getAppointmentCells(
    start: string,
    end: string,
  ): number {
    return (
      (this.toMinutes(end) -
        this.toMinutes(start)) /
      30
    );
  }


  // =========================
  // APPOINTMENT COLOR
  // =========================

  getAppointmentColor(
    appointment: (typeof this.appointments)[number],
  ): string {

    const index =
      this.appointments.indexOf(appointment);

    return this.appointmentColors[
      index % this.appointmentColors.length
    ];
  }


  // =========================
  // TIME
  // =========================

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