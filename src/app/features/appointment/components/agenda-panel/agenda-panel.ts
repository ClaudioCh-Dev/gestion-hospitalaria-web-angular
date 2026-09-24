import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { TuiIcon } from '@taiga-ui/core';

import { AppointmentResponse } from '../../interfaces';

export interface AgendaItem {
  appointment: AppointmentResponse;
  start: string;
  end: string;
  doctorName: string;
  typeTitle: string;
  colorClasses: string;
  // En curso: minutos para terminar; próxima: minutos para empezar
  minutes: number;
  // Solo en curso: porcentaje transcurrido (0-100)
  progress: number;
}

export interface AgendaLegendItem {
  title: string;
  colorClasses: string;
}

// Panel lateral de la agenda: citas en curso, próximas de hoy y leyenda de colores
@Component({
  selector: 'app-agenda-panel',
  imports: [TuiIcon],
  templateUrl: './agenda-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPanel {
  readonly current = input.required<AgendaItem[]>();

  readonly upcoming = input.required<AgendaItem[]>();

  readonly legend = input.required<AgendaLegendItem[]>();

  readonly loading = input(false);

  readonly select = output<AppointmentResponse>();

  protected formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }
}
