import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiIcon } from '@taiga-ui/core';

// Tarjeta de estadística de los resúmenes (facturación, historial). En móvil va compacta y sin ícono.
@Component({
  selector: 'app-stat-card',
  imports: [TuiIcon],
  template: `
    <header class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate text-xs text-slate-500">{{ title() }}</p>

        <h2 class="mt-1 truncate text-base font-semibold text-slate-900 sm:text-xl">
          @if (loading()) {
            <span class="inline-block h-5 w-20 animate-pulse rounded bg-slate-200"></span>
          } @else {
            {{ value() }}
          }
        </h2>

        @if (caption()) {
          <p class="mt-0.5 text-xs text-slate-400">{{ caption() }}</p>
        }
      </div>

      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 max-sm:hidden"
      >
        <tui-icon [icon]="icon()" />
      </div>
    </header>
  `,
  host: {
    class: 'block min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly title = input.required<string>();

  readonly value = input.required<string>();

  readonly icon = input.required<string>();

  readonly caption = input<string | null>(null);

  readonly loading = input(false);
}
