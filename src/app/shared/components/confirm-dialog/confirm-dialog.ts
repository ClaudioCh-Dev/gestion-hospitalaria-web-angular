import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title: string;
  // Explicación de lo que va a pasar (texto plano)
  message: string;
  // Elemento afectado, destacado en una caja (p. ej. nombre, correo, "5 pacientes")
  subject?: string;
  // Detalle secundario del elemento (p. ej. DNI)
  subjectDetail?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  // Ilustración propia (ruta en public/); por defecto la de la variante
  image?: string;
}

// Ilustraciones en public/illustrations y apariencia del botón de confirmar
const VARIANTS: Record<ConfirmVariant, { image: string; button: string }> = {
  danger: { image: 'illustrations/confirm-danger.svg', button: 'primary-destructive' },
  warning: { image: 'illustrations/confirm-warning.svg', button: 'primary-destructive' },
  info: { image: 'illustrations/confirm-info.svg', button: 'primary' },
};

/**
 * Diálogo de confirmación de la app (reemplaza a TUI_CONFIRM), con TuiBlockStatus:
 * ilustración arriba, título, explicación y el elemento afectado.
 * Se abre con ConfirmService.ask(); devuelve true si el usuario confirma.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [TuiBlockStatus, TuiButton],
  template: `
    <tui-block-status size="m">
      <img tuiSlot="top" alt="" class="h-32 w-auto" [src]="options.image ?? style().image" />

      <h2>{{ options.title }}</h2>

      <p class="text-sm leading-relaxed text-slate-500">{{ options.message }}</p>

      @if (options.subject) {
        <div class="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="break-words text-sm font-semibold text-slate-900">{{ options.subject }}</p>
          @if (options.subjectDetail) {
            <p class="mt-0.5 text-xs text-slate-500">{{ options.subjectDetail }}</p>
          }
        </div>
      }
    </tui-block-status>

    <!-- Fuera del block-status para controlar el orden: móvil apilados (confirmar arriba),
         escritorio en fila a la derecha (confirmar al final) -->
    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button tuiButton type="button" size="m" appearance="secondary" (click)="context.completeWith(false)">
        {{ options.cancelLabel ?? 'Cancelar' }}
      </button>

      <button tuiButton type="button" size="m" [appearance]="style().button" (click)="context.completeWith(true)">
        {{ options.confirmLabel }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly context = injectContext<TuiDialogContext<boolean, ConfirmOptions>>();

  protected readonly options = this.context.data;

  protected readonly style = computed(() => VARIANTS[this.options.variant ?? 'danger']);
}
