import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  Subscription,
  catchError,
  defer,
  distinctUntilChanged,
  forkJoin,
  retry,
  switchMap,
  throwError,
} from 'rxjs';

import { TuiNotificationService } from '@taiga-ui/core';

import { AuthService } from '@core/services/auth.service';

import { NOTIFICATION_READ_ADMIN, NOTIFICATION_READ_DOCTOR } from '../constants/notification-permissions';
import { NotificationResponse } from '../interfaces';
import { NotificationApiService } from '../services/notification-api.service';
import { NotificationStream, NotificationStreamUnauthorizedError } from '../services/notification-stream.service';

// Igual que el backend (findTop50...)
const MAX_ITEMS = 50;

/**
 * Estado de la campana del navbar: lista, no leídas y conexión al stream SSE.
 *
 * Se activa sola al iniciar sesión un usuario con NOTIFICATION_READ_ADMIN o
 * NOTIFICATION_READ_DOCTOR y se desconecta al cerrar sesión. Basta con inyectarlo.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly authService = inject(AuthService);
  private readonly api = inject(NotificationApiService);
  private readonly stream = inject(NotificationStream);
  private readonly toasts = inject(TuiNotificationService);

  private readonly _items = signal<NotificationResponse[]>([]);

  readonly items = this._items.asReadonly();

  readonly unreadCount = computed(() => this._items().filter(item => !item.read).length);

  private readonly isAdmin = computed(() => this.authService.hasPermission(NOTIFICATION_READ_ADMIN));

  // Hay que mostrar la campana (basta con cualquiera de los dos permisos)
  readonly enabled = computed(
    () => this.isAdmin() || this.authService.hasPermission(NOTIFICATION_READ_DOCTOR),
  );

  // Usuario con campana; cambia solo al entrar/salir o cambiar de usuario, no al renovar el token
  private readonly sessionUserId = computed(() =>
    this.enabled() ? (this.authService.currentUser()?.userId ?? null) : null,
  );

  private reloadSubscription?: Subscription;

  constructor() {
    toObservable(this.sessionUserId)
      .pipe(
        distinctUntilChanged(),
        switchMap(userId => (userId === null ? this.endSession() : this.startSession())),
        takeUntilDestroyed(),
      )
      .subscribe(notification => this.receive(notification));
  }

  // =========================
  // LISTA
  // =========================

  reload(): void {
    this.reloadSubscription?.unsubscribe();

    const request$ = this.isAdmin() ? this.api.findForAdmin() : this.api.findMine();

    // El interceptor ya muestra el error; la campana se queda con lo que tenía
    this.reloadSubscription = request$.subscribe({
      next: items => this._items.set(items),
      error: () => undefined,
    });
  }

  markAsRead(id: number): void {
    const item = this._items().find(notification => notification.id === id);

    if (!item || item.read) {
      return;
    }

    // Optimista: si falla, vuelve a no leída
    this.setRead([id], true);

    this.api.markAsRead(id).subscribe({
      error: () => this.setRead([id], false),
    });
  }

  markAllAsRead(): void {
    const ids = this._items()
      .filter(item => !item.read)
      .map(item => item.id);

    if (!ids.length) {
      return;
    }

    this.setRead(ids, true);

    // No hay endpoint masivo: una petición por notificación (máximo 50)
    forkJoin(ids.map(id => this.api.markAsRead(id))).subscribe({
      error: () => this.reload(),
    });
  }

  // =========================
  // SESIÓN / STREAM
  // =========================

  private startSession(): Observable<NotificationResponse> {
    this.reload();

    let firstOpen = true;

    // Tras una reconexión se recarga la lista: pudo llegar algo mientras estaba caída
    const onOpen = () => {
      if (!firstOpen) {
        this.reload();
      }

      firstOpen = false;
    };

    // defer: cada reintento lee el token vigente
    return defer(() => this.stream.connect(this.authService.accessToken() ?? '', onOpen)).pipe(
      retry({
        count: 3,
        resetOnSuccess: true,
        // Token expirado: se renueva y se vuelve a conectar. Otro error: se deja de reintentar
        delay: error =>
          error instanceof NotificationStreamUnauthorizedError
            ? this.authService.refreshToken()
            : throwError(() => error),
      }),
      // Sin stream la campana sigue funcionando con la lista (se actualiza al recargar la página)
      catchError(() => EMPTY),
    );
  }

  private endSession(): Observable<never> {
    this.reloadSubscription?.unsubscribe();
    this._items.set([]);

    return EMPTY;
  }

  private receive(notification: NotificationResponse): void {
    this._items.update(items =>
      [notification, ...items.filter(item => item.id !== notification.id)].slice(0, MAX_ITEMS),
    );

    this.toasts
      .open(notification.message, {
        label: notification.title,
        appearance: 'info',
        autoClose: 5000,
      })
      .subscribe();
  }

  private setRead(ids: number[], read: boolean): void {
    this._items.update(items => items.map(item => (ids.includes(item.id) ? { ...item, read } : item)));
  }
}
