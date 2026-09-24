import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Contenedor de las listas de tarjetas (facturación, historial): tarjeta blanca con
 * sombra, 1 columna y 2 desde xl. Mientras carga muestra tarjetas esqueleto.
 */
@Component({
  selector: 'app-record-list',
  template: `
    @if (loading()) {
      @for (item of skeletons; track item) {
        <div class="animate-pulse rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="h-3 w-24 rounded bg-slate-200"></div>
              <div class="h-5 w-36 rounded bg-slate-200"></div>
            </div>

            <div class="h-6 w-20 rounded-full bg-slate-200"></div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            @for (info of [1, 2, 3]; track info) {
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 shrink-0 rounded bg-slate-200"></div>

                <div class="space-y-2">
                  <div class="h-2 w-16 rounded bg-slate-200"></div>
                  <div class="h-3 w-20 rounded bg-slate-200"></div>
                </div>
              </div>
            }
          </div>

          <div class="mt-5 flex items-center justify-between">
            <div class="h-4 w-20 rounded bg-slate-200"></div>
            <div class="h-9 w-28 rounded bg-slate-200"></div>
          </div>
        </div>
      }
    } @else {
      <ng-content />
    }
  `,
  host: {
    class:
      'grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-md sm:p-4 xl:grid-cols-2',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordList {
  readonly loading = input(false);

  protected readonly skeletons = [1, 2, 3, 4];
}
