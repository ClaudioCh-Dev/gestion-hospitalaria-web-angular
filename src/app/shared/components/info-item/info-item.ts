import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiIcon } from '@taiga-ui/core';

// Dato con ícono, etiqueta y valor (proyectado) de las tarjetas de registros
@Component({
  selector: 'app-info-item',
  imports: [TuiIcon],
  template: `
    <tui-icon [icon]="icon()" class="shrink-0 text-slate-400" />

    <div class="min-w-0">
      <p class="text-xs text-slate-400">{{ label() }}</p>

      <div class="mt-1 text-sm text-slate-800">
        <ng-content />
      </div>
    </div>
  `,
  host: {
    class: 'flex min-w-0 items-center gap-3',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoItem {
  readonly icon = input.required<string>();

  readonly label = input.required<string>();
}
