import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';

export type StateMessageVariant = 'empty' | 'error';

const DEFAULT_ICONS: Record<StateMessageVariant, string> = {
  empty: '@tui.inbox',
  error: '@tui.circle-x',
};

// Estado vacío o de error homogéneo para listados, tablas y gráficos
@Component({
  selector: 'app-state-message',
  imports: [TuiAvatar, TuiButton],
  templateUrl: './state-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateMessage {
  readonly variant = input<StateMessageVariant>('empty');

  readonly title = input.required<string>();

  readonly description = input('');

  readonly icon = input<string | null>(null);

  // Texto del botón; en errores se muestra "Reintentar" por defecto
  readonly actionLabel = input<string | null>(null);

  // Versión más baja para tarjetas pequeñas o celdas de tabla
  readonly compact = input(false);

  readonly action = output<void>();

  protected readonly resolvedIcon = computed(
    () => this.icon() ?? DEFAULT_ICONS[this.variant()],
  );

  protected readonly resolvedActionLabel = computed(
    () => this.actionLabel() ?? (this.variant() === 'error' ? 'Reintentar' : null),
  );
}
