import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiAutoColorPipe, TuiAvatar, TuiAvatarStack, TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TuiDataList, TuiTitle } from '@taiga-ui/core';
import { TuiCardMedium } from '@taiga-ui/layout';

@Component({
  selector: 'app-cell-callendar',
  imports: [
    FormsModule,
    TuiChevron,
    TuiSelect,
    TuiDataList,
    TuiCardMedium,
    TuiTitle,
    TuiAutoColorPipe,
    TuiAvatar,
    TuiAvatarStack,
  ],
  templateUrl: './cell-callendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellCallendar {

  days = [
    { name: 'Lun', date: 17 },
    { name: 'Mar', date: 18 },
    { name: 'Mié', date: 19 },
    { name: 'Jue', date: 20 },
    { name: 'Vie', date: 21 },
  ];

  hours = this.generateHours();

  calendarViews = [
    'Semana',
    'Día',
    'Mes',
  ];

  selectedView = 'Semana';

appointments = [
  {
    day: 19,
    start: '09:00',
    end: '10:00',
    patient: 'Juan Pérez',
    type: 'Consulta general',
    doctor: 'Dr. García',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    day: 18,
    start: '10:30',
    end: '11:30',
    patient: 'María López',
    type: 'Control médico',
    doctor: 'Dra. Torres',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
  {
    day: 20,
    start: '14:00',
    end: '15:30',
    patient: 'Carlos Ruiz',
    type: 'Consulta cardiológica',
    doctor: 'Dr. Ramírez',
    avatar: 'https://i.pravatar.cc/100?img=33',
  },
];

getAppointment(day: number, time: string) {
  return this.appointments.find(
    appointment =>
      appointment.day === day &&
      appointment.start === time
  );
}

getAppointmentCells(start: string, end: string): number {
  return (
    (this.toMinutes(end) - this.toMinutes(start)) / 30
  );
}

getAppointmentHeight(start: string, end: string): number {
  const startMinutes = this.toMinutes(start);
  const endMinutes = this.toMinutes(end);

  const duration = endMinutes - startMinutes;

  // Cada 30 minutos = 48px
  return (duration / 30) * 48;
}

private toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}
  private generateHours(): string[] {
    const hours: string[] = [];

    for (let hour = 8; hour <= 21; hour++) {
      hours.push(`${hour.toString().padStart(2, '0')}:00`);
      hours.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    hours.push('22:00');

    return hours;
  }

}