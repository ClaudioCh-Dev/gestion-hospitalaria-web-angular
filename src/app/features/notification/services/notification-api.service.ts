import { Observable } from 'rxjs';

import { NotificationResponse } from '../interfaces';

// Se llama "Api" para no confundirlo con NotificationService de core (avisos en pantalla)
export abstract class NotificationApiService {

  // Últimas 50 de las citas del médico autenticado (el usuario sale del token)
  abstract findMine(): Observable<NotificationResponse[]>;

  // Últimas 50 de todas las citas
  abstract findForAdmin(): Observable<NotificationResponse[]>;

  // La lectura es por usuario: marcarla no afecta a los demás
  abstract markAsRead(id: number): Observable<void>;
}
