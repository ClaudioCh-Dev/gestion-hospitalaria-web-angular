import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { environment } from '@environments/environment';

import { NotificationResponse } from '../interfaces';
import { NotificationStream, NotificationStreamUnauthorizedError } from './notification-stream.service';

// Error que corta los reintentos de la librería (401, 403...)
class FatalStreamError extends Error {}

// Cada cuánto reintenta la librería tras una caída de red o del servidor
const RETRY_MS = 5_000;

/**
 * EventSource nativo no permite la cabecera Authorization (el gateway exige JWT):
 * fetchEventSource abre el stream con fetch, así que sí puede enviarla.
 */
@Injectable()
export class NotificationStreamHttpService implements NotificationStream {

  private readonly url = `${environment.api.baseUrl}/notifications/stream`;

  connect(token: string, onOpen?: () => void): Observable<NotificationResponse> {
    return new Observable<NotificationResponse>(subscriber => {
      const controller = new AbortController();

      fetchEventSource(this.url, {
        signal: controller.signal,
        // Por defecto se desconecta con la pestaña oculta; así sigue recibiendo
        openWhenHidden: true,
        // Las cabeceras se fijan al conectar: con otro token hay que volver a llamar a connect()
        headers: { Authorization: `Bearer ${token}` },

        async onopen(response) {
          if (response.status === 401) {
            throw new NotificationStreamUnauthorizedError();
          }

          // 5xx (p. ej. notification-ms reiniciándose): error normal, la librería reintenta
          if (response.status >= 500) {
            throw new Error(`SSE ${response.status}`);
          }

          if (!response.ok) {
            throw new FatalStreamError(`SSE ${response.status}`);
          }

          onOpen?.();
        },

        onmessage: message => {
          if (message.event === 'notification' && message.data) {
            subscriber.next(JSON.parse(message.data) as NotificationResponse);
          }
        },

        // El servidor cerró la conexión (reinicio, despliegue): se trata como caída para reconectar
        onclose: () => {
          throw new Error('SSE cerrado por el servidor');
        },

        onerror: error => {
          if (error instanceof NotificationStreamUnauthorizedError || error instanceof FatalStreamError) {
            throw error; // sin reintentos
          }

          return RETRY_MS;
        },
      }).then(
        () => subscriber.complete(), // solo al abortar (desuscripción)
        error => subscriber.error(error),
      );

      return () => controller.abort();
    });
  }
}
