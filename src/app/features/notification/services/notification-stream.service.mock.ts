import { Injectable, inject } from '@angular/core';
import { Observable, filter, interval, map, take } from 'rxjs';

import { AuthService } from '@core/services/auth.service';

import { NOTIFICATION_READ_ADMIN } from '../constants/notification-permissions';
import { NotificationResponse } from '../interfaces';
import { NOTIFICATION_MOCK_SCENARIOS } from '../mocks/notification.mocks';
import { NotificationApiMockService } from './notification-api.service.mock';
import { NotificationStream } from './notification-stream.service';

// Cada cuánto "llega" una notificación en modo mock
const MOCK_INTERVAL_MS = 30_000;

// Sin providedIn: solo lo registra data-providers.mock.ts
@Injectable()
export class NotificationStreamMockService implements NotificationStream {

  private readonly authService = inject(AuthService);

  private readonly api = inject(NotificationApiMockService);

  connect(_token: string, onOpen?: () => void): Observable<NotificationResponse> {
    return new Observable<NotificationResponse>(subscriber => {
      onOpen?.();

      // Una vez por sesión (desde el login): programada → confirmada → cancelada, y se detiene
      return interval(MOCK_INTERVAL_MS)
        .pipe(
          take(NOTIFICATION_MOCK_SCENARIOS.length),
          map(index => this.api.simulate(NOTIFICATION_MOCK_SCENARIOS[index])),
          // Igual que el backend: a los admins y al médico de la cita
          filter(
            notification =>
              this.authService.hasPermission(NOTIFICATION_READ_ADMIN) ||
              notification.doctorUserId === this.authService.currentUser()?.userId,
          ),
          map(({ doctorUserId, ...notification }) => ({ ...notification, read: false })),
        )
        .subscribe(subscriber);
    });
  }
}
