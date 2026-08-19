import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TuiButton, TuiIcon, TuiPoint } from '@taiga-ui/core';
	import {type TuiContext} from '@taiga-ui/cdk';

import { TuiAxes, TuiLineChart, TuiLineChartHint, TuiPieChart } from '@taiga-ui/addon-charts';

@Component({
  selector: 'app-dashboard-page',
  imports: [TuiButton, TuiIcon, TuiLineChart, TuiPieChart, TuiAxes, TuiLineChartHint],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  stats = [
    {
      title: 'Pacientes',
      value: '1,284',
      change: '+12.5%',
      description: 'vs. mes anterior',
      icon: '@tui.users',
    },
    {
      title: 'Citas hoy',
      value: '48',
      change: '+8.2%',
      description: 'vs. ayer',
      icon: '@tui.calendar',
    },
    {
      title: 'Médicos',
      value: '36',
      change: '+3',
      description: 'disponibles hoy',
      icon: '@tui.stethoscope',
    },
    {
      title: 'Ingresos',
      value: 'S/ 24,580',
      change: '+14.8%',
      description: 'este mes',
      icon: '@tui.wallet',
    },
  ];

  appointments = [
    {
      patient: 'Carlos Mendoza',
      doctor: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      time: '09:00',
      status: 'Confirmada',
    },
    {
      patient: 'María García',
      doctor: 'Dra. Ana Torres',
      specialty: 'Pediatría',
      time: '10:30',
      status: 'Pendiente',
    },
    {
      patient: 'Luis Ramírez',
      doctor: 'Dr. Pedro Sánchez',
      specialty: 'Traumatología',
      time: '11:00',
      status: 'Confirmada',
    },
    {
      patient: 'Andrea Flores',
      doctor: 'Dra. Carla Ruiz',
      specialty: 'Dermatología',
      time: '12:30',
      status: 'Pendiente',
    },
  ];

  protected readonly appointmentsChart: readonly TuiPoint[] = [
    [50, 50],
    [100, 75],
    [150, 50],
    [200, 150],
    [250, 155],
    [300, 190],
    [350, 90],
  ];
  protected readonly stringify = String;

  protected readonly hintContent = ({ $implicit }: TuiContext<readonly TuiPoint[]>): number =>
    $implicit[0]?.[1] ?? 0;

  genderChart = [
    {
      gender: 'Femenino',
      patients: 680,
    },
    {
      gender: 'Masculino',
      patients: 520,
    },
    {
      gender: 'Otros',
      patients: 84,
    },
  ];
}
