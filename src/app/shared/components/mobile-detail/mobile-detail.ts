import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';

export interface MobileDetailField {
  icon: string;
  label: string;
  value: string;
  // Ocupa la fila completa, sea 1 o 2 columnas (p. ej. correos largos)
  wide?: boolean;
}

/**
 * Cuerpo del detalle a pantalla completa de las listas en móvil: cabecera
 * proyectada (<ng-content />) y los campos como tuiCell.
 *
 * La tui-app-bar y el <footer tuiFloatingContainer> van en la plantilla que abre
 * el diálogo, como hijos directos de tui-dialog: los estilos 'fullscreen' de Taiga
 * (barra fija arriba, pie con acciones) solo se aplican a hijos directos.
 */
@Component({
  selector: 'app-mobile-detail',
  imports: [TuiCell, TuiIcon, TuiTitle],
  template: `
    <ng-content />

    @if (fields().length) {
      <!-- Máximo 2 columnas: cada campo pide al menos 12rem y como mínimo la mitad del ancho -->
      <section class="-mx-4 grid grid-cols-[repeat(auto-fill,minmax(max(12rem,50%),1fr))]">
        @for (field of fields(); track field.label) {
          <div tuiCell="m" tuiCellHeight="spacious" [class.col-span-full]="field.wide">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <tui-icon [icon]="field.icon" class="text-base" />
            </span>

            <div tuiTitle class="min-w-0">
              <span tuiSubtitle>{{ field.label }}</span>
              <span class="break-words">{{ field.value }}</span>
            </div>
          </div>
        }
      </section>
    }
  `,
  host: {
    class: 'flex flex-col gap-6 pt-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileDetail {
  readonly fields = input<MobileDetailField[]>([]);
}
