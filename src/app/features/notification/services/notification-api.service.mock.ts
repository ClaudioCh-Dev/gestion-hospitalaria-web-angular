import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

import { NotificationResponse } from '../interfaces';
import { NOTIFICATIONS_MOCK, NotificationMock, NotificationMockScenario } from '../mocks/notification.mocks';
import { NotificationApiService } from './notification-api.service';

// Sin providedIn: solo lo registra data-providers.mock.ts. El stream simulado lo usa directamente.
@Injectable()
export class NotificationApiMockService extends NotificationApiService {

  private readonly authService = inject(AuthService);

  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly MOCK_DELAY = 600;

  // Más reciente primero, igual que el backend
  private notifications: NotificationMock[] = structuredClone(NOTIFICATIONS_MOCK);

  // Como notification_recipients: "userId:notificationId" de lo que cada usuario leyó
  private readonly readBy = new Set<string>();

  // =====================================================
  // QUERIES
  // =====================================================

  findMine(): Observable<NotificationResponse[]> {
    const userId = this.authService.currentUser()?.userId;

    const mine = this.notifications.filter(item => item.doctorUserId === userId);

    return of(this.toResponses(mine)).pipe(delay(this.MOCK_DELAY));
  }

  findForAdmin(): Observable<NotificationResponse[]> {
    return of(this.toResponses(this.notifications)).pipe(delay(this.MOCK_DELAY));
  }

  // =====================================================
  // MARK AS READ
  // =====================================================

  markAsRead(id: number): Observable<void> {
    if (!this.notifications.some(item => item.id === id)) {
      return this.handleError(404, 'Notificación no encontrada', 'Notificación no encontrada', 'NOTIFICATION_NOT_FOUND');
    }

    this.readBy.add(`${this.authService.currentUser()?.userId}:${id}`);

    return of(undefined).pipe(delay(this.MOCK_DELAY / 2));
  }

  // =====================================================
  // STREAM SIMULADO
  // =====================================================

  /** Guarda el escenario como si llegara de Kafka y lo devuelve con su id (y su médico). */
  simulate(scenario: NotificationMockScenario): NotificationMock {
    const notification: NotificationMock = {
      ...scenario,
      id: Math.max(0, ...this.notifications.map(item => item.id)) + 1,
      scheduledAt: scenario.scheduledAt ?? this.inThreeDays(),
      read: false,
      createdAt: this.toLocalIso(new Date()),
    };

    this.notifications = [notification, ...this.notifications];

    return notification;
  }

  // =====================================================
  // HELPERS
  // =====================================================

  // El backend no expone doctorUserId y calcula "read" para el usuario del token
  private toResponses(items: NotificationMock[]): NotificationResponse[] {
    const userId = this.authService.currentUser()?.userId;

    return items.slice(0, 50).map(({ doctorUserId, ...item }) => ({
      ...item,
      read: this.readBy.has(`${userId}:${item.id}`),
    }));
  }

  // Dentro de 3 días a las 10:00 (misma fecha para la cita programada y su confirmación)
  private inThreeDays(): string {
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    date.setHours(10, 0, 0, 0);

    return this.toLocalIso(date);
  }

  // LocalDateTime de Java: sin zona horaria
  private toLocalIso(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
  }

  private handleError(status: number, title: string, detail: string, code: string): Observable<never> {
    const problem: ProblemDetailMicroservice = {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: undefined,
      code,
    };

    const error = new HttpErrorResponse({ status, statusText: title, error: problem });

    this.errorHandler.handle(error);

    return throwError(() => error);
  }
}
