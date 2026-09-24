import { Injectable, inject } from '@angular/core';
import { Observable, defaultIfEmpty } from 'rxjs';

import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { ConfirmDialog, ConfirmOptions } from '../components/confirm-dialog/confirm-dialog';

/**
 * Confirmaciones de la app:
 *
 *   this.confirm.ask({ title: '¿Eliminar paciente?', message: '...', subject: 'Juan Pérez', confirmLabel: 'Eliminar' })
 *     .pipe(filter(Boolean), switchMap(() => ...))
 *
 * Emite true al confirmar y false al cancelar o cerrar con la ✕.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialogs = inject(TuiDialogService);

  ask(options: ConfirmOptions): Observable<boolean> {
    return this.dialogs
      .open<boolean>(new PolymorpheusComponent(ConfirmDialog), {
        size: 's',
        data: options,
      })
      .pipe(defaultIfEmpty(false));
  }
}
