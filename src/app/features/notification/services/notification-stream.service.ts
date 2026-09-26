import { Observable } from 'rxjs';

import { NotificationResponse } from '../interfaces';

// El token ya no sirve (401): quien se suscribe renueva el token y vuelve a conectar
export class NotificationStreamUnauthorizedError extends Error {
  constructor() {
    super('SSE 401');
  }
}

/**
 * Conexión al stream SSE de notification-ms (GET /notifications/stream).
 *
 * Emite cada notificación nueva mientras haya suscripción; al desuscribirse cierra la conexión.
 * Si se cae la red o se reinicia el servidor, reconecta sola y llama a onOpen en cada
 * conexión (sirve para recargar la lista y no perder lo que llegó mientras estaba caída).
 * Termina con NotificationStreamUnauthorizedError si el token expiró.
 */
export abstract class NotificationStream {
  abstract connect(token: string, onOpen?: () => void): Observable<NotificationResponse>;
}
