import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { PageResponse } from '@shared/models/page.type';

// "Mostrando X de Y registros" con página anterior / siguiente
@Component({
  selector: 'app-simple-pager',
  imports: [TuiButton, TuiIcon],
  template: `
    <span class="text-sm text-slate-500">
      Mostrando {{ page().numberOfElements }} de {{ page().totalElements }} registros
    </span>

    <div class="flex items-center gap-2">
      <button
        appearance="secondary"
        size="s"
        tuiButton
        type="button"
        aria-label="Página anterior"
        [disabled]="page().first || loading()"
        (click)="previous.emit()"
      >
        <tui-icon icon="@tui.chevron-left" />
      </button>

      <span class="text-sm text-slate-600">Página {{ page().number + 1 }} de {{ page().totalPages }}</span>

      <button
        appearance="secondary"
        size="s"
        tuiButton
        type="button"
        aria-label="Página siguiente"
        [disabled]="page().last || loading()"
        (click)="next.emit()"
      >
        <tui-icon icon="@tui.chevron-right" />
      </button>
    </div>
  `,
  host: {
    class: 'flex flex-wrap items-center justify-between gap-3',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimplePager {
  readonly page = input.required<PageResponse<unknown>>();

  readonly loading = input(false);

  readonly previous = output<void>();

  readonly next = output<void>();
}
