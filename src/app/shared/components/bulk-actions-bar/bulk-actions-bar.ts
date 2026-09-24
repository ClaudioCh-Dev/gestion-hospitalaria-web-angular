import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

// Barra que aparece sobre una tabla cuando hay filas seleccionadas.
// Las acciones se proyectan como contenido.
@Component({
  selector: 'app-bulk-actions-bar',
  imports: [TuiButton],
  template: `
    <div
      class="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2"
      role="toolbar"
      [attr.aria-label]="count() + ' ' + itemLabel() + ' seleccionados'"
    >
      <span class="text-sm font-medium text-blue-900">
        {{ count() }} {{ count() === 1 ? itemLabelSingular() : itemLabel() }}
        {{ count() === 1 ? 'seleccionado' : 'seleccionados' }}
      </span>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <ng-content />

        <button
          tuiButton
          type="button"
          size="s"
          appearance="flat"
          iconStart="@tui.x"
          [disabled]="busy()"
          (click)="clear.emit()"
        >
          Limpiar selección
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkActionsBar {
  readonly count = input.required<number>();

  readonly itemLabel = input('elementos');

  readonly itemLabelSingular = input('elemento');

  // Deshabilita "Limpiar selección" mientras corre una acción
  readonly busy = input(false);

  readonly clear = output<void>();
}
