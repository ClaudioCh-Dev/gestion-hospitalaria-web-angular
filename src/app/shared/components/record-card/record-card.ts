import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

/**
 * Tarjeta de registro (factura, historia clínica): cabecera con fecha, título y estado.
 * - Datos: elementos con el atributo card-content (se colocan en 2 columnas en móvil, 3 desde md).
 * - Pie: elementos con el atributo card-footer.
 */
@Component({
  selector: 'app-record-card',
  imports: [DatePipe, TuiCardLarge, TuiHeader, TuiTitle],
  templateUrl: './record-card.html',
  host: {
    class: 'block min-w-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordCard {
  readonly date = input.required<string>();

  readonly title = input.required<string>();

  readonly status = input.required<string>();

  readonly statusClass = input.required<string>();
}
